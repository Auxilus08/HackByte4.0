from .accidents import router as accidents_router
from .volunteers import router as volunteers_router
from .tasks import router as tasks_router
from .rewards import router as rewards_router

__all__ = ["accidents_router", "volunteers_router", "tasks_router", "rewards_router"]
