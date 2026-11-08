from core.groq_client import client
from models.reasoning import ReasoningRequest
from settings import settings


def build_prompt(request: ReasoningRequest) -> str:
    return (
        f"The scoring system picked '{request.goalName}' as tonight's focus. "
        f"Score: {request.score:.2f}. Weight: {request.weight}/5. "
        f"Deadline in {request.deadlineDays} days. "
        f"Not worked on for {request.neglectedDays} days. "
        "In one short, warm sentence (under 20 words) tell the user why this goal was picked tonight. "
        "Translate the numbers into meaning: weight means importance, neglect means time since last worked on, deadline means urgency. "
        "Sound like a close friend texting you. Do not add advice."
    )


def stream_reasoning(request: ReasoningRequest):
    # streams one token at a time — router wraps this in StreamingResponse
    stream = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": build_prompt(request)}],
        stream=True,
        max_tokens=100,
    )
    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token
