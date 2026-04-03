"""CRUD routes for Tasks."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
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
    """Update task status and timestamps."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

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
