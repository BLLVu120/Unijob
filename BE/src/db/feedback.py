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
    """
    Thêm đánh giá của ứng viên về nhà tuyển dụng.

    Chỉ ứng viên đã được nhận (application.status = 'recruited') ở tin đó mới được đánh giá,
    và mỗi ứng viên chỉ đánh giá một lần cho mỗi tin.
    """
    try:
        with engine.begin() as connection:
            job = connection.execute(
                text("SELECT employer_id FROM jobs WHERE job_id = :job_id"),
                {"job_id": feedback_data["job_id"]},
            ).fetchone()
            if not job or str(job.employer_id) != str(feedback_data["emp_id"]):
                return {"status": False, "error": "Tin tuyển dụng không thuộc nhà tuyển dụng này"}

            recruited = connection.execute(
                text(
                    "SELECT 1 FROM applications WHERE job_id = :job_id AND candidate_id = :candidate_id"
                    " AND status = 'recruited'"
                ),
                feedback_data,
            ).fetchone()
            if not recruited:
                return {"status": False, "error": "Chỉ ứng viên đã được nhận mới có thể đánh giá"}

            existed = connection.execute(
                text("SELECT 1 FROM feedbacks WHERE job_id = :job_id AND candidate_id = :candidate_id"),
                feedback_data,
            ).fetchone()
            if existed:
                return {"status": False, "error": "Bạn đã đánh giá nhà tuyển dụng cho công việc này"}

            connection.execute(
                text(
                    "INSERT INTO feedbacks (job_id, candidate_id, emp_id, rate, comment) "
                    "VALUES (:job_id, :candidate_id, :emp_id, :rate, :comment)"
                ),
                feedback_data,
            )
            return {
                "status": True,
                "message": "Feedback added successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }
