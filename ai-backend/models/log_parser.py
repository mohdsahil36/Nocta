from pydantic import BaseModel, Field
from typing import Literal

# constrains outcome to the 4 valid types — Pydantic rejects anything else at parse time
OutcomeType = Literal["completed", "partial", "postponed", "changed"]

class ParseLogRequest(BaseModel):
    text: str        # raw free-text the user typed
    goalName: str    # winning goal name — gives the LLM context for extraction

class ParseLogResponse(BaseModel):
    outcome: OutcomeType                          # extracted outcome, validated against the enum
    notes: str                                    # cleaned-up one-line summary of what happened
    confidence: float = Field(ge=0.0, le=1.0)    # model's certainty — gates whether we pre-fill or ask user to pick
