from datetime import datetime
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from src.db.connection import DB
from src.db.interview import add_interview, get_interview_by_candidate_id, get_interview_by_emp_id, update_interview

router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)

class Interview(BaseModel):
    interview_id: Optional[str] = None
    job_id: Optional[str] = None
    emp_id: Optional[str] = None
    candidate_id: Optional[str] = None
    time: Optional[datetime] = None
    duration: Optional[int] = None


@router.post("/add")
def add_messages(interview_data: Interview):

    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = add_interview(engine, interview_data.dict())

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }

@router.post("/update")
def update_interview_info(update_data: Interview):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    data = update_data.dict()
    stmt = update_interview(engine, data)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }

@router.get("/get_by_candidate_id")
def get_by_candidate_id(candidate_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_interview_by_candidate_id(engine, candidate_id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    interviews = [dict(row._mapping) for row in stmt["interviews"]]
    return {
        "status": True,
        "interviews": interviews
    }

@router.get("/get_by_emp_id")
def get_by_emp_id(emp_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_interview_by_emp_id(engine, emp_id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    interviews = [dict(row._mapping) for row in stmt["interviews"]]
    return {
        "status": True,
        "interviews": interviews
    }
