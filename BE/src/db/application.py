import logging

from sqlalchemy import text

from src.utils.sql_builder import build_insert_parts

logger = logging.getLogger(__name__)


def add_application(engine, application_data: dict) -> dict:
    try:
        with engine.begin() as connection:
            _,cols,vals = build_insert_parts(application_data)
            query = text(f"""INSERT INTO applications
                         ({cols})
                         VALUES ({vals})""")
            connection.execute(query, application_data)
            return {
                "status": True,
                "message": "Application added successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_application_by_candidate_id(engine, candidate_id: str):
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM applications WHERE candidate_id = :candidate_id")
            result = connection.execute(query, {"candidate_id": candidate_id})
            return {
                "status": True,
                "applications": result.fetchall()
            }
    except Exception as error:
        logger.error("Error retrieving applications: %s", error)
        return {
            "status": False,
            "error": str(error)}

def get_application_by_job_id(engine, job_id: str):
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM applications WHERE job_id = :job_id")
            result = connection.execute(query, {"job_id": job_id})
            return {
                "status": True,
                "applications": result.fetchall()
            }
    except Exception as error:
        logger.error("Error retrieving applications: %s", error)
        return {
            "status": False,
            "error": str(error)}

def update_application_status(engine, application_id: str, status: str):
    """Cập nhật trạng thái hồ sơ ứng tuyển (submitted, screening, interview, rejected, withdrawn, recruited)."""
    try:
        with engine.begin() as connection:
            query = text("""
                UPDATE applications
                SET status = :status, updated_at = CURRENT_TIMESTAMP
                WHERE application_id = :application_id
            """)
            result = connection.execute(query, {"application_id": application_id, "status": status})
            if result.rowcount == 0:
                return {"status": False, "error": "Application not found"}
            return {"status": True, "message": "Application status updated successfully"}
    except Exception as error:
        return {"status": False, "error": str(error)}
