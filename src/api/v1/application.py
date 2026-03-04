from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from typing import Optional
import uuid
import os
import shutil
from fastapi.responses import JSONResponse
from src.db.connection import DB
from src.db.application import add_application, get_application_by_candidate_id,get_application_by_job_id

router = APIRouter(
    prefix="/application",
    tags=["Application"]
)
class Application(BaseModel):
    application_id: Optional[str] = None
    job_id: Optional[str] = None
    candidate_id: Optional[str] = None
    cv_url: Optional[str] = None
    status: Optional[str] = None

UPLOAD_DIR = "src/store/cv/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 5MB

    
@router.post("/add")
def add_applications(application_data: Application):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = add_application(engine, application_data.dict())
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }

@router.post("/upload-cv")
async def upload_cv(cv: UploadFile = File(...)):
    try:
        # Validate extension
        file_ext = cv.filename.split(".")[-1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only PDF allowed")

        # Validate file size
        contents = await cv.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")

        # Reset pointer sau khi read
        await cv.seek(0)

        # Tạo tên file unique
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(cv.file, buffer)

        cv_url = f"/src/store/cv/{unique_name}"

        return JSONResponse({
            "status": True,
            "cv_url": cv_url
        })

    except Exception as e:
        return JSONResponse({
            "status": False,
            "error": str(e)
        }, status_code=500)

@router.get("/get_by_job_id")
def get_applications_by_job_id(job_id: str):    
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_application_by_job_id(engine, job_id)
    
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

@router.get("/get_by_candidate_id")
def get_applications_by_candidate_id(candidate_id: str):    
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_application_by_candidate_id(engine, candidate_id)
    
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