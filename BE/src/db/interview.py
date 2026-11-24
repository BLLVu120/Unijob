import logging

from sqlalchemy import text

from src.utils.sql_builder import build_insert_parts

logger = logging.getLogger(__name__)


def add_interview(engine, interview_data: dict) -> dict:
    """Add a new job to the database."""
    try:
        with engine.begin() as connection:
            _,cols,vals = build_insert_parts(interview_data)
            query = text(f"""INSERT INTO interviews
                         ({cols})
                         VALUES ({vals})""")
            connection.execute(query, interview_data)
            return {
                "status": True,
                "message": "Interview added successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def update_interview(engine, interview_data: dict) -> dict:
    """Update an existing job in the database."""
    try:
        filtered_data,columns,values = build_insert_parts(interview_data)
        if not columns or not values:
            return {
                "status": False,
                "error": "No valid fields to update"
            }
        with engine.begin() as connection:
            set_clause = ", ".join([f"{field} = :{field}" for field in filtered_data.keys()])
            query = text(f"""
                UPDATE interviews
                SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                WHERE interview_id = :interview_id
            """)

            # Add email to the parameters
            params = {**filtered_data, "interview_id": interview_data["interview_id"]}

            result = connection.execute(query, params)

            if result.rowcount == 0:
                return {
                    "status": False,
                    "error": "Update failed"
                }

            return {
                "status": True,
                "message": "Interview updated successfully",
                "updated_fields": list(filtered_data.keys())
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_interview_by_emp_id(engine, emp_id: str):
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM interviews WHERE emp_id = :emp_id")
            result = connection.execute(query, {"emp_id": emp_id})
            return {
                "status": True,
                "interviews": result.fetchall()
            }
    except Exception as error:
        logger.error("Error retrieving interviews: %s", error)
        return {
            "status": False,
            "error": str(error)}

def get_interview_by_candidate_id(engine, candidate_id: str):
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM interviews WHERE candidate_id = :candidate_id")
            result = connection.execute(query, {"candidate_id": candidate_id})
            return {
                "status": True,
                "interviews": result.fetchall()
            }
    except Exception as error:
        logger.error("Error retrieving interviews: %s", error)
        return {
            "status": False,
            "error": str(error)}
