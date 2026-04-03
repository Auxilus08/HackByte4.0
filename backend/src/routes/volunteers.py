"""CRUD routes for Volunteers."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.models.volunteer import Volunteer
from src.schemas.volunteer import (
    VolunteerCreate,
    VolunteerRead,
    VolunteerUpdate,
    VolunteerList,
)
from src.utils import latlng_to_wkb, geom_to_latlng

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


def _row_to_schema(row: Volunteer) -> VolunteerRead:
    """Convert an ORM Volunteer row to the Pydantic read schema."""
    return VolunteerRead(
        id=row.id,
        name=row.name,
        phone=row.phone,
        wallet_address=row.wallet_address,
        location=geom_to_latlng(row.current_location),
        is_available=row.is_available,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("/", response_model=VolunteerList)
async def list_volunteers(
    skip: int = 0,
    limit: int = 50,
    available_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List all volunteers with optional availability filter."""
    query = select(Volunteer)
    count_query = select(func.count(Volunteer.id))

    if available_only:
        query = query.where(Volunteer.is_available.is_(True))
        count_query = count_query.where(Volunteer.is_available.is_(True))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(
        query.order_by(Volunteer.created_at.desc()).offset(skip).limit(limit)
    )
    rows = result.scalars().all()
    return VolunteerList(total=total, items=[_row_to_schema(r) for r in rows])


@router.get("/{volunteer_id}", response_model=VolunteerRead)
async def get_volunteer(
    volunteer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single volunteer by ID."""
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Volunteer not found")
    return _row_to_schema(row)


@router.post("/", response_model=VolunteerRead, status_code=status.HTTP_201_CREATED)
async def create_volunteer(
    body: VolunteerCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new volunteer."""
    volunteer = Volunteer(
        name=body.name,
        phone=body.phone,
        wallet_address=body.wallet_address,
        current_location=latlng_to_wkb(body.location) if body.location else None,
        is_available=body.is_available,
    )
    db.add(volunteer)
    await db.flush()
    await db.refresh(volunteer)
    return _row_to_schema(volunteer)


@router.patch("/{volunteer_id}", response_model=VolunteerRead)
async def update_volunteer(
    volunteer_id: UUID,
    body: VolunteerUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Partially update a volunteer (e.g. update location, availability)."""
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    volunteer = result.scalar_one_or_none()
    if volunteer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Volunteer not found")

    update_data = body.model_dump(exclude_unset=True)
    if "location" in update_data and update_data["location"] is not None:
        from src.schemas.accident import LatLng
        volunteer.current_location = latlng_to_wkb(LatLng(**update_data.pop("location")))
    elif "location" in update_data:
        update_data.pop("location")

    for field, value in update_data.items():
        setattr(volunteer, field, value)

    await db.flush()
    await db.refresh(volunteer)
    return _row_to_schema(volunteer)


@router.delete("/{volunteer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_volunteer(
    volunteer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a volunteer by ID."""
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    volunteer = result.scalar_one_or_none()
    if volunteer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Volunteer not found")
    await db.delete(volunteer)
