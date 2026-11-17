from fastapi import APIRouter
from models.syllabus import SyllabusRequest, SyllabusResponse
from services.syllabus import generate_syllabus

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/syllabus", response_model=SyllabusResponse)
def syllabus(request: SyllabusRequest):
    return generate_syllabus(request)