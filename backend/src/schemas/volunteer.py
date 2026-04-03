"""Pydantic schemas for the Volunteer entity."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from .accident import LatLng


# ── Create ─────────────────────────────────────────────────────
class VolunteerCreate(BaseModel):
    name: str = Field(..., min_length=1, examples=["Rahul Sharma"])
    phone: str = Field(..., min_length=1, examples=["+919876543210"])
    wallet_address: str | None = Field(None, examples=["0xABC..."])
    location: LatLng | None = None
    is_available: bool = True


# ── Read (response) ───────────────────────────────────────────
class VolunteerRead(BaseModel):
    id: UUID
    name: str
    phone: str
    wallet_address: str | None = None
    location: LatLng | None = None
    is_available: bool | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Update (partial) ──────────────────────────────────────────
class VolunteerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    wallet_address: str | None = None
    location: LatLng | None = None
    is_available: bool | None = None


# ── List wrapper ───────────────────────────────────────────────
class VolunteerList(BaseModel):
    total: int
    items: list[VolunteerRead]
