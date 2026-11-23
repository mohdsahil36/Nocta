from pydantic import BaseModel
from typing import Literal, Optional


class SyllabusRequest(BaseModel):
    goalName: str
    notes: Optional[str] = None


class SyllabusStep(BaseModel):
    title: str
    level: Literal["Basic", "Intermediate", "Advanced"]
    order: int
    resources: list[str] = []


class SyllabusResponse(BaseModel):
    steps: list[SyllabusStep]
