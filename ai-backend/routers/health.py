from fastapi import APIRouter
from models.health import HealthResponse
from settings import settings

router=APIRouter()

@router.get("/health",response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok",service=settings.app_name)