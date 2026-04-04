"""Auth routes — login/register for volunteers and admin."""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.settings import settings
from src.models.volunteer import Volunteer
from src.services.auth import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user,
)
from src.utils import latlng_to_wkb, geom_to_latlng

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Schemas ────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])
    password: str = Field(..., min_length=4, examples=["pass1234"])


class LatLng(BaseModel):
    lat: float
    lng: float


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, examples=["Rahul Sharma"])
    phone: str = Field(..., min_length=1, examples=["+919876543210"])
    password: str = Field(..., min_length=4, examples=["pass1234"])
    wallet_address: str | None = Field(None, examples=["0xABC..."])
    location: LatLng | None = None


class AdminLoginRequest(BaseModel):
    username: str = Field(..., examples=["admin"])
    password: str = Field(..., examples=["admin123"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str


class MeResponse(BaseModel):
    id: str
    name: str
    role: str
    phone: str | None = None
    wallet_address: str | None = None


# ── Admin Login ────────────────────────────────────────────────
# For hackathon demo: hardcoded admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(body: AdminLoginRequest):
    """Login as admin with username/password."""
    if body.username != ADMIN_USERNAME or body.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    token = create_access_token({
        "sub": "admin",
        "role": "admin",
        "name": "System Admin",
    })

    return TokenResponse(
        access_token=token,
        role="admin",
        user_id="admin",
        name="System Admin",
    )


# ── Volunteer Register ─────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_volunteer(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new volunteer account."""
    # Check if phone already exists
    existing = await db.execute(
        select(Volunteer).where(Volunteer.phone == body.phone)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered",
        )

    volunteer = Volunteer(
        name=body.name,
        phone=body.phone,
        password_hash=hash_password(body.password),
        wallet_address=body.wallet_address,
        is_available=True,
    )
    if body.location:
        volunteer.location_geom = latlng_to_wkb(body.location.lat, body.location.lng)
    db.add(volunteer)
    await db.flush()
    await db.refresh(volunteer)

    token = create_access_token({
        "sub": str(volunteer.id),
        "role": "volunteer",
        "name": volunteer.name,
    })

    logger.info("New volunteer registered: %s (%s)", volunteer.name, volunteer.phone)

    return TokenResponse(
        access_token=token,
        role="volunteer",
        user_id=str(volunteer.id),
        name=volunteer.name,
    )


# ── Volunteer Login ────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def volunteer_login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login as a volunteer with phone + password."""
    result = await db.execute(
        select(Volunteer).where(Volunteer.phone == body.phone)
    )
    volunteer = result.scalar_one_or_none()

    if volunteer is None or not volunteer.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
        )

    if not verify_password(body.password, volunteer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
        )

    token = create_access_token({
        "sub": str(volunteer.id),
        "role": "volunteer",
        "name": volunteer.name,
    })

    return TokenResponse(
        access_token=token,
        role="volunteer",
        user_id=str(volunteer.id),
        name=volunteer.name,
    )


# ── Get Current User ──────────────────────────────────────────
@router.get("/me", response_model=MeResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current authenticated user info."""
    return MeResponse(
        id=user.get("sub", ""),
        name=user.get("name", ""),
        role=user.get("role", ""),
    )
