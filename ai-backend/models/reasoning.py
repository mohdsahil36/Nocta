from pydantic import BaseModel

class ReasoningRequest(BaseModel):
    goalName:str # name of the winning goal
    score:float # score of the winning goal
    weight:int # weight/importance of the winning goal
    deadlineDays: int # days until the deadline
    neglectedDays:int # days since last worked on