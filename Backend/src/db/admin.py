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

def get_all_applications(engine):
    """Retrieve all applications from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM applications")
            result = connection.execute(query)
            return {
                "status": True,
                "applications": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving applications: {error}")
        return {
            "status": False,
            "error": str(error)}

def get_all_interviews(engine):
    """Retrieve all interviews from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM interviews")
            result = connection.execute(query)
            return {
                "status": True,
                "interviews": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving interviews: {error}")
        return {
            "status": False,
            "error": str(error)}

def get_all_messages(engine):
    """Retrieve all messages from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM messages")
            result = connection.execute(query)
            return {
                "status": True,
                "messages": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving messages: {error}")
        return {
            "status": False,
            "error": str(error)}

def get_all_feedbacks(engine):
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

def get_all_transactions(engine):
    """Retrieve all transactions from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM transactions")
            result = connection.execute(query)
            return {
                "status": True,
                "transactions": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving transactions: {error}")
        return {
            "status": False,
            "error": str(error)}

