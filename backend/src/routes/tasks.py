"""CRUD routes for Tasks."""

import logging
import os
import uuid as uuid_mod
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.models.task import Task
from src.models.accident import Accident
from src.models.volunteer import Volunteer
from src.schemas.task import (
    TaskCreate,
    TaskRead,
    TaskUpdate,
    TaskList,
)
from src.services.blockchain import blockchain_svc
from src.services.verifier import verify_task_images

logger = logging.getLogger(__name__)

# ── Upload directory ──────────────────────────────────────────
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "proofs"
UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=TaskList)
async def list_tasks(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all tasks with optional status filter."""
    query = select(Task)
    count_query = select(func.count(Task.id))

    if status_filter:
        query = query.where(Task.status == status_filter)
        count_query = count_query.where(Task.status == status_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(
        query.order_by(Task.assigned_at.desc()).offset(skip).limit(limit)
    )
    rows = result.scalars().all()
    return TaskList(
        total=total,
        items=[TaskRead.model_validate(r) for r in rows],
    )


@router.get("/pool-info")
async def get_pool_info():
    """Get blockchain reward pool status."""
    return await blockchain_svc.get_pool_info()


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single task by ID."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskRead.model_validate(row)


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new task assignment."""
    # Verify the accident exists
    acc = await db.execute(select(Accident).where(Accident.id == body.accident_id))
    if acc.scalar_one_or_none() is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Accident not found")

    # Verify the volunteer exists
    vol = await db.execute(select(Volunteer).where(Volunteer.id == body.volunteer_id))
    if vol.scalar_one_or_none() is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Volunteer not found")

    task = Task(
        accident_id=body.accident_id,
        volunteer_id=body.volunteer_id,
        status=body.status,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    
    task_data = TaskRead.model_validate(task)
    
    # ── WebSocket Broadcast ───────────────────────────────────
    try:
        from src.services.websocket import manager
        await manager.broadcast("task_updated", task_data.model_dump(mode="json"))
    except Exception:
        pass
        
    return task_data


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: UUID,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update task status and timestamps.
    
    When status is set to 'verified', the system automatically:
    1. Sets verified_at timestamp
    2. Distributes a MATIC reward to the volunteer's wallet
    3. Stores the transaction hash
    4. Broadcasts the update via WebSocket
    """
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = body.model_dump(exclude_unset=True)
    
    # ── Enforce proof upload before completion ─────────────────
    if update_data.get("status") == "completed":
        proofs = task.proof_images or []
        if len(proofs) < 1:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="You must upload at least one proof image before marking the task as complete. Please upload photos of the emergency scene and that help has arrived.",
            )

    # ── Detect verification trigger ───────────────────────────
    is_verification = (
        update_data.get("status") == "verified"
        and task.status != "verified"
        and task.reward_tx_hash is None
    )
    
    for field, value in update_data.items():
        setattr(task, field, value)

    # ── Auto-set verified_at timestamp ────────────────────────
    if is_verification and task.verified_at is None:
        task.verified_at = datetime.now(timezone.utc)

    # ── Blockchain reward distribution ────────────────────────
    if is_verification:
        # Look up the volunteer's wallet address
        vol_result = await db.execute(
            select(Volunteer).where(Volunteer.id == task.volunteer_id)
        )
        volunteer = vol_result.scalar_one_or_none()

        if volunteer and volunteer.wallet_address:
            logger.info(
                "🔗 Triggering blockchain reward for task=%s → volunteer=%s (%s)",
                str(task.id)[:8], volunteer.name, volunteer.wallet_address[:10] + "...",
            )
            tx_hash = await blockchain_svc.distribute_reward(
                volunteer_wallet=volunteer.wallet_address,
                task_id=str(task.id),
            )
            if tx_hash:
                task.reward_tx_hash = tx_hash
                logger.info("✅ Reward tx stored: %s", tx_hash[:20] + "...")
            else:
                logger.warning("⚠️ Reward distribution returned no tx hash")
        else:
            logger.warning(
                "⚠️ Cannot distribute reward — volunteer %s has no wallet address",
                task.volunteer_id,
            )

    await db.flush()
    await db.refresh(task)
    
    task_data = TaskRead.model_validate(task)
    
    # ── WebSocket Broadcast ───────────────────────────────────
    try:
        from src.services.websocket import manager
        await manager.broadcast("task_updated", task_data.model_dump(mode="json"))
    except Exception:
        pass
        
    return task_data


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a task by ID."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")
    await db.delete(task)


# ── Proof Image Upload ────────────────────────────────────────
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_PROOF_IMAGES = 5
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/{task_id}/proofs")
async def upload_proof_images(
    task_id: UUID,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload proof images for a task.
    
    Volunteers must upload at least one proof image (emergency scene
    and/or help arrival) before they can mark a task as completed.
    Accepts up to 5 images (jpg, jpeg, png, webp), max 10 MB each.
    """
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")

    existing = task.proof_images or []
    if len(existing) + len(files) > MAX_PROOF_IMAGES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_PROOF_IMAGES} proof images allowed per task. Currently {len(existing)} uploaded.",
        )

    saved_urls: list[str] = []
    task_dir = UPLOAD_DIR / str(task_id)
    task_dir.mkdir(parents=True, exist_ok=True)

    for upload in files:
        # Validate file extension
        ext = Path(upload.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        # Read and validate size
        content = await upload.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"File '{upload.filename}' exceeds 10 MB limit.",
            )

        # Save with a unique filename
        unique_name = f"{uuid_mod.uuid4().hex}{ext}"
        file_path = task_dir / unique_name
        with open(file_path, "wb") as f:
            f.write(content)

        # Build the URL path for the file
        url = f"/uploads/proofs/{task_id}/{unique_name}"
        saved_urls.append(url)

    # Update the task's proof_images in DB
    task.proof_images = existing + saved_urls
    await db.flush()
    await db.refresh(task)

    # ── Run ML Verification on new images ─────────────────────
    verification_results = []
    try:
        verification_results = await verify_task_images(saved_urls, UPLOAD_ROOT)
        logger.info(
            "🔍 Verified %d proof image(s) for task %s",
            len(verification_results), str(task_id)[:8],
        )
    except Exception as e:
        logger.warning("⚠️ Image verification failed: %s", e)
        verification_results = [
            {"image_url": url, "error": "Verification service unavailable"}
            for url in saved_urls
        ]

    # Merge with existing verification results
    existing_results = task.verification_results or []
    task.verification_results = existing_results + verification_results
    await db.flush()
    await db.refresh(task)

    task_data = TaskRead.model_validate(task)

    # ── WebSocket Broadcast ───────────────────────────────────
    try:
        from src.services.websocket import manager
        await manager.broadcast("task_updated", task_data.model_dump(mode="json"))
    except Exception:
        pass

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": f"{len(saved_urls)} proof image(s) uploaded successfully.",
            "proof_images": task.proof_images,
            "verification_results": task.verification_results,
        },
    )
