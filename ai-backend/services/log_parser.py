import json
from fastapi import HTTPException
from core.groq_client import client
from models.log_parser import ParseLogRequest,ParseLogResponse
from settings import settings

def build_prompt(request: ParseLogRequest) -> str:
    return (
        f"You're helping track progress on a goal called '{request.goalName}'. "
        f"Here's what the user wrote about tonight: \"{request.text}\". "
    "Figure out what happened — did they finish it, do part of it, skip it, or switch to something else? "
        "Pick one: completed, partial, postponed, or changed. "
        "Write a short note (under 15 words) on what actually happened. "
        "Give a confidence score from 0.0 to 1.0 — be honest if it's unclear. "
        "Return only valid JSON: {\"outcome\": \"...\", \"notes\": \"...\", \"confidence\": 0.0}"
    )

def parse_log(request: ParseLogRequest) -> ParseLogResponse:
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": build_prompt(request)}],
        response_format={"type": "json_object"},
        max_tokens=150,
    )

    try:
        data = json.loads(response.choices[0].message.content)
        return ParseLogResponse(**data)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=422, detail=f"Could not parse response: {e}")