from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from src.db.candidate import (
    add_new_candidate,
    delete_candidate,
    get_candidate_by_email,
    get_candidate_by_id,
    update_candidate,
)
from src.db.connection import DB

router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"]
)

class Candidate(BaseModel):
    full_name: str = None
    dob: str  = None
    gender: Optional[str] = None
    email: str = None
    password: str = None
    phone_number: str = None
    address: str = None
    cid: str = None
    is_verified: Optional[bool] = False

@router.post("/add")
def add_candidate(candidate_data: Candidate):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    data = candidate_data.dict()
    stmt = add_new_candidate(engine, data)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }

@router.get("/get_by_email")
def get_candidate(email: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_candidate_by_email(engine, email)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    candidate = stmt["candidate"]
    return {
        "status": True,
        "candidate": candidate
    }

@router.get("/get_by_id")
def get_by_id(id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_candidate_by_id(engine, id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    candidate = stmt["candidate"]
    return {
        "status": True,
        "candidate": candidate
    }


@router.post("/update_info")
def update_candidate_info(update_data: Candidate):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    data = update_data.dict()
    stmt = update_candidate(engine, data["email"], data)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }

@router.delete("/delete")
def delete_candidates(email: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = delete_candidate(engine, email)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    return {
        "status": True,
        "message": stmt['message']
    }
