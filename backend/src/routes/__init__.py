from .accidents import router as accidents_router
from .volunteers import router as volunteers_router
from .tasks import router as tasks_router
from .voice import router as voice_router
from .auth import router as auth_router

__all__ = ["accidents_router", "volunteers_router", "tasks_router", "voice_router", "auth_router"]
