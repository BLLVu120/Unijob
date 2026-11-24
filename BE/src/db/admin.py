import logging

from sqlalchemy import text

logger = logging.getLogger(__name__)


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
        logger.error("Error retrieving candidates: %s", error)
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
        logger.error("Error retrieving jobs: %s", error)
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
        logger.error("Error retrieving applications: %s", error)
        return {
            "status": False,
            "error": str(error)}
