from sqlalchemy.engine import Engine
from sqlalchemy import text

def get_feedback_by_employer_id(engine, emp_id: str) -> dict:
    """Retrieve feedbacks for a specific employer."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM feedbacks WHERE emp_id = :emp_id")
            result = connection.execute(query, {"emp_id": emp_id})
            feedbacks = [dict(row._mapping) for row in result]
            return {
                "status": True,
                "feedbacks": feedbacks
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def add_feedback(engine, feedback_data: dict) -> dict:
    """Add a new job to the database."""
    try:
        with engine.begin() as connection:
            query = text("INSERT INTO feedbacks (job_id, candidate_id, emp_id, rate, comment) VALUES (:job_id,:candidate_id,:emp_id, :rate, :comment)")
            connection.execute(query, feedback_data)
            return {
                "status": True,
                "message": "Feedback added successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }