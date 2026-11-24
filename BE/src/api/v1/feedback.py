from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.db.connection import DB
from src.db.feedback import add_feedback, get_feedback_by_employer_id

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)

class Feedback(BaseModel):
    job_id: str
    emp_id: str
    candidate_id: str
    rate: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


@router.get("/get_feedback_by_employer_id")
def get_feedback_by_employer(emp_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_feedback_by_employer_id(engine, emp_id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "feedbacks": stmt['feedbacks']
    }

@router.post("/add_feedback")
def add_feedbacks(feedback_data: Feedback):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = add_feedback(engine, feedback_data.dict())

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }
