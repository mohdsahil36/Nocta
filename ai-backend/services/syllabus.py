import json
from core.groq_client import client
from models.syllabus import SyllabusRequest,SyllabusResponse, SyllabusStep
from settings import settings

def build_prompt(request:SyllabusRequest)->str:
    notes = f" Additional context: {request.notes}." if request.notes else ""
    return (
        f"Create a structured learning syllabus for the goal: '{request.goalName}'.{notes} "
        "Return 5 to 8 ordered steps. Each step must have: "
        "title (short action phrase), level (Basic, Intermediate, or Advanced), order (starting from 1). "
        "Return only a JSON object with a 'steps' array. No explanation, no markdown."
    )

def generate_syllabus(request:SyllabusRequest)->SyllabusResponse:
    response=client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role":"user","content":build_prompt(request)}],
        response_format={"type":"json_object"},
        max_tokens=800
    )
    raw=response.choices[0].message.content
    data=json.load(raw)
    steps = [SyllabusStep(**s) for s in data["steps"]]
    return SyllabusResponse(steps=steps)