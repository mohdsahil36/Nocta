from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from groq import Groq
from models.reasoning import ReasoningRequest
from settings import settings

router = APIRouter(prefix="/ai", tags=["ai"])

# one Groq client shared across all requests
client = Groq(api_key=settings.groq_api_key)


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


def stream_tokens(request: ReasoningRequest):
    prompt = build_prompt(request)

    # ask Groq to stream — returns an iterable, not a full response
    stream = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=100,
    )

    # each iteration gives one chunk with one token
    for chunk in stream:
        token = chunk.choices[0].delta.content
        # if the token is present then yield it and give it back to the frontend
        if token:
            yield token


@router.post("/reasoning")
def reasoning(request: ReasoningRequest):
    # StreamingResponse calls stream_tokens lazily and pushes each token as it arrives
    return StreamingResponse(stream_tokens(request), media_type="text/plain")
