
from fastapi import APIRouter

from src.db.admin import (
    get_all_applications,
    get_all_candidates,
    get_all_employers,
    get_all_jobs,
)
from src.db.connection import DB

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
