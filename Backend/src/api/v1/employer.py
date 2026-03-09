from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.db.connection import DB
from src.db.emp import add_new_employer, get_employer_by_email, update_employer,get_employer_by_id

router = APIRouter(
    prefix="/employer",
    tags=["Employer"]
)

class Employer(BaseModel):
    emp_name: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    tax_code: Optional[str] = None
    email: str
    password: Optional[str] = None
    phone_number: Optional[str] = None
    description: Optional[str] = None
    field: Optional[str] = None
    scope: Optional[str] = None
    representative_name: Optional[str] = None
    cid: Optional[str] = None
    is_verified: bool = False
    score: Optional[float] = None

@router.get("/get_by_email")
def get_employer(email: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_employer_by_email(engine, email)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    employer = stmt["employer"]
    return {
        "status": True,
        "employer": employer
    }

@router.get("/get_by_id")
def get_by_id(id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_employer_by_id(engine, id)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    employer = stmt["employer"]
    return {
        "status": True,
        "employer": employer
    }

@router.post("/add")
def add_employer(employer_data: Employer):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = add_new_employer(engine, employer_data.dict())
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }

@router.post("/update_info")
def update_employer_info(update_data: Employer):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    data = update_data.dict()
    stmt = update_employer(engine, data["email"], data)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }