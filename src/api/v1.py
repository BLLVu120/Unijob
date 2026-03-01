from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
from db.admin import get_all_candidates, get_all_employers, get_all_feedback, get_all_jobs
from db.candidate import add_new_candidate, get_candidate_by_email,update_candidate
from db.emp import add_new_employer, get_employer_by_email, update_employer
from db.connection import DB
from datetime import datetime

from db.feedback import add_feedback, get_feedback_by_employer_id
from db.job import add_job, delete_job, search_job, update_job

app = FastAPI()

class Candidate(BaseModel):
    full_name: str
    dob: str
    gender: Optional[str]
    email: str
    password: str
    phone_number: str
    address: str
    cid: str
    linkedin_link: Optional[str] = None

class Employer(BaseModel):
    emp_name: str
    address: str
    website: Optional[str] = None
    tax_code: str
    email: str
    password: str
    phone_number: Optional[str] = None
    description: Optional[str] = None
    scope: Optional[str] = None
    representative_name: str
    cid: str
    is_verified: bool = False
    status: str = "active"
    score: Optional[float] = 100

class Job(BaseModel):
    job_id: Optional[str] = None
    employer_id: str
    title: str
    description: str
    requirements: str
    benefits: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    is_remote: bool = False
    expiry_date: datetime
    status: str = "active"

class JobSearchCriteria(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    is_remote: Optional[bool] = None
    sort_by: Optional[str] = "newest"
    limit: Optional[int] = 10

class Feedback(BaseModel):
    job_id: str
    emp_id: str
    candidate_id: str
    rate: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
### CANDIDATE-----------------------------------------------------------------------------------
@app.get("/get_candidate_by_email")
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

@app.post("/add_candidate")
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

@app.post("/update_candidate_info")
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


### EMPLOYER------------------------------------------------------------------------------------
@app.get("/get_employer_by_email")
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

@app.post("/add_employer")
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

@app.post("/update_employer_info")
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

### JOB ------------------------------------------------------------------------------------
@app.get("/search_jobs")
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

@app.post("/add_job")
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

@app.post("/delete_job")
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

@app.post("/update_job")
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


### Feedback--------------------------------------------------------------------------------
@app.get("/get_feedback_by_employer_id")
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

@app.post("/add_feedback")
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

### ADMIN-----------------------------------------------------------------------------------
@app.get("/get_all_candidates")
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

@app.get("/get_all_employers")
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

@app.get("/get_all_feedback")
def get_all_feedbacks():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_feedback(engine)
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

@app.get("/get_all_jobs")
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

if __name__ == "__main__":
    uvicorn.run(
        "api.v1:app",      # file_name:app_instance
        host="0.0.0.0",
        port=8000,
        reload=True
    )
