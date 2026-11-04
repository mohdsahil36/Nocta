from fastapi import APIRouter
from routers.health import router as health_router
from routers.reasoning import router as reasoning_router

router = APIRouter()

router.include_router(health_router)
router.include_router(reasoning_router)