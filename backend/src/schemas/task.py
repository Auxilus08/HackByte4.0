"""Pydantic schemas for the Task entity."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ── Create ─────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    accident_id: UUID
    volunteer_id: UUID
    status: str = Field("pending", examples=["pending"])


# ── Read (response) ───────────────────────────────────────────
class TaskRead(BaseModel):
    id: UUID
    accident_id: UUID
    volunteer_id: UUID
    status: str | None = None
    assigned_at: datetime | None = None
    accepted_at: datetime | None = None
    completed_at: datetime | None = None
    verified_at: datetime | None = None
    reward_tx_hash: str | None = None
    proof_images: list[str] | None = None
    verification_results: list[dict] | None = None

    model_config = {"from_attributes": True}


# ── Update (partial) ──────────────────────────────────────────
class TaskUpdate(BaseModel):
    status: str | None = None
    accepted_at: datetime | None = None
    completed_at: datetime | None = None
    verified_at: datetime | None = None
    reward_tx_hash: str | None = None
    proof_images: list[str] | None = None
    verification_results: list[dict] | None = None


# ── List wrapper ───────────────────────────────────────────────
class TaskList(BaseModel):
    total: int
    items: list[TaskRead]
