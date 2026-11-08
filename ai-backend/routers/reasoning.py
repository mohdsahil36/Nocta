from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.reasoning import ReasoningRequest
from services.reasoning import stream_reasoning

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/reasoning")
def reasoning(request: ReasoningRequest):
    return StreamingResponse(stream_reasoning(request), media_type="text/plain")
