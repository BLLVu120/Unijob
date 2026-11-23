from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.db.connection import DB
from src.db.job import add_job, search_job,delete_job,update_job,get_job_by_id,get_job_by_emp_id

router = APIRouter(
    prefix="/job",
    tags=["Job"]
)

class Job(BaseModel):
    job_id: Optional[str] = None
    employer_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    role: Optional[str] = None
    education_level: Optional[str] = None
    experience: Optional[int] = None
    num_slot: Optional[int] = None
    job_type: Optional[str] = None
    working_shifts: Optional[str] = None
    is_active: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    
class JobSearchCriteria(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    is_remote: Optional[bool] = None
    sort_by: Optional[str] = "newest"
    limit: Optional[int] = 10


@router.get("/search")
def search_jobs(search_criteria: JobSearchCriteria):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = search_job(engine, search_criteria.dict())
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    print(stmt)
    # jobs = [dict(row._mapping) for row in stmt["jobs"]]
    return {
        "status": True,
        "jobs": stmt["jobs"],
        "count": stmt["count"]
    }

@router.get("/get_by_id")
def get_by_id(id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_job_by_id(engine, id)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    job = [dict(row._mapping) for row in stmt["job"]][0]
    return {
        "status": True,
        "job": job
    }
@router.get("/get_by_emp_id")
def get_by_emp_id(emp_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_job_by_emp_id(engine, emp_id)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    jobs = [dict(row._mapping) for row in stmt["job"]]
    return {
        "status": True,
        "jobs": jobs
    }
@router.post("/add")
def add_new_job(job_data: Job):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = add_job(engine, job_data.dict())
    
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
def delete_jobs(job_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = delete_job(engine, job_id)
    
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
def update_job_info(update_data: Job):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    data = update_data.dict()
    stmt = update_job(engine, data)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }