from fastapi import APIRouter
from models.log_parser import ParseLogRequest, ParseLogResponse
from services.log_parser import parse_log

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/parse-log", response_model=ParseLogResponse)
def log_parsing(request: ParseLogRequest):
    return parse_log(request)