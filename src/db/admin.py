import os
from sqlalchemy.engine import Engine
from sqlalchemy import text

### QUERY--------------------------------------------------------------------------------
def get_all_employers(engine):
    """Retrieve all employers from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM employers")
            result = connection.execute(query)
            return {
                "status": True,
                "employers": result.fetchall()
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }
        
def get_all_candidates(engine):
    """Retrieve all candidates from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM candidates")
            result = connection.execute(query)
            return {
                "status": True,
                "candidates": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving candidates: {error}")
        return {
            "status": False,
            "error": str(error)}

def get_all_jobs(engine):
    """Retrieve all jobs from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM jobs")
            result = connection.execute(query)
            return {
                "status": True,
                "jobs": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving jobs: {error}")
        return {
            "status": False,
            "error": str(error)}

def get_all_feedback(engine):
    """Retrieve all feedback from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM feedbacks")
            result = connection.execute(query)
            return {
                "status": True,
                "feedback": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving feedback: {error}")
        return {
            "status": False,
            "error": str(error)}

### DELETE --------------------------------------------------------------------------------
def delete_candidate(engine, email: str) -> dict:
    """Delete a candidate from the database by email."""
    try:
        with engine.begin() as connection:
            query = text("DELETE FROM candidates WHERE email = :email")
            result = connection.execute(query, {"email": email})

            if result.rowcount > 0:
                return {
                    "status": True,
                    "message": "Candidate deleted successfully"
                }
            else:
                return {
                    "status": True,
                    "error": "Candidate not found"
                }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

### UPDATE --------------------------------------------------------------------------------

