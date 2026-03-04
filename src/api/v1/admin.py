from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.db.connection import DB
from src.db.admin import (
    get_all_candidates,
    get_all_employers,
    get_all_jobs,
    get_all_applications,
    get_all_interviews,
    get_all_messages, 
    get_all_feedbacks, 
    get_all_transactions)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/get_all_candidates")
def get_candidates():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_candidates(engine)
    # print(stmt['candidates'])
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    candidates = [dict(row._mapping) for row in stmt["candidates"]]
    return {
        "status": True,
        "candidates": candidates
    }

@router.get("/get_all_employers")
def get_employers():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_employers(engine)
    # print(stmt['candidates'])
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    employers = [dict(row._mapping) for row in stmt["employers"]]
    return {
        "status": True,
        "employers": employers
    }

@router.get("/get_all_jobs")
def get_jobs():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_jobs(engine)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    jobs = [dict(row._mapping) for row in stmt["jobs"]]
    return {
        "status": True,
        "jobs": jobs
    }

@router.get("/get_all_applications")
def get_applications():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_applications(engine)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    applications = [dict(row._mapping) for row in stmt["applications"]]
    return {
        "status": True,
        "applications": applications
    }

@router.get("/get_all_interviews")
def get_interviews():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_interviews(engine)
    
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

@router.get("/get_all_messages")
def get_messages():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_messages(engine)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    messages = [dict(row._mapping) for row in stmt["messages"]]
    return {
        "status": True,
        "messages": messages
    }

@router.get("/get_all_feedbacks")
def get_feedbacks():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_feedbacks(engine)
    # print(stmt['candidates'])
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    feedback = [dict(row._mapping) for row in stmt["feedback"]]
    return {
        "status": True,
        "feedback": feedback
    }


@router.get("/get_all_transactions")
def get_transactions():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_transactions(engine)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    transactions = [dict(row._mapping) for row in stmt["transactions"]]
    return {
        "status": True,
        "transactions": transactions
    }

