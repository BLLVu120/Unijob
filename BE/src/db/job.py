from sqlalchemy import text
from sqlalchemy.engine import Engine

from src.utils.sql_builder import build_insert_parts


def add_job(engine, job_data: dict) -> dict:
    """Add a new job with dynamic columns."""
    try:
        with engine.begin() as connection:

            # Lấy danh sách column từ job_data
            _,col_clause,val_clause = build_insert_parts(job_data)


            query = text(f"""
                INSERT INTO jobs ({col_clause})
                VALUES ({val_clause})
            """)

            connection.execute(query, job_data)

            return {
                "status": True,
                "message": "Job added successfully"
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def delete_job(engine, job_id: str) -> dict:
    """Delete a job from the database by job ID."""
    try:
        with engine.begin() as connection:
            query = text("DELETE FROM jobs WHERE job_id = :job_id")
            result = connection.execute(query, {"job_id": job_id})

            if result.rowcount > 0:
                return {
                    "status": True,
                    "message": "Job deleted successfully"
                }
            else:
                return {
                    "status": True,
                    "error": "Job not found"
                }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def update_job(engine, update_data: dict) -> dict:
    """Update job information in the database."""
    try:
        with engine.begin() as connection:
            if "job_id" not in update_data:
                return {
                    "status": False,
                    "error": "Job ID is required for updating job information"
                }
            cols = [col for col in update_data.keys() if update_data[col] is not None]

            set_clause = ", ".join(f"{col} = :{col}" for col in cols)
            query = text(f"UPDATE jobs SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE job_id = :job_id")
            connection.execute(query, {**update_data, "job_id": update_data["job_id"]})

            return {
                "status": True,
                "message": "Job updated successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

SEARCH_SORTS = {
    "newest": "j.created_at DESC",
    "oldest": "j.created_at ASC",
    "salary": "COALESCE(j.salary_max, j.salary_min, 0) DESC, j.created_at DESC",
    "expired_day": "j.expiry_date ASC NULLS LAST",
}
SEARCH_JOB_TYPES = ("remote", "offline", "hybrid")
SEARCH_DEFAULT_LIMIT = 100
SEARCH_MAX_LIMIT = 500


def build_search_query(criteria: dict) -> tuple[str, dict]:
    """
    Dựng câu SELECT tìm tin tuyển dụng công khai (đang mở, chưa hết hạn).

    criteria:
        keyword     tìm trong tiêu đề, vị trí, tên công ty (không phân biệt hoa thường / dấu)
        location    một phần địa chỉ (không phân biệt dấu)
        salary_min  lương tối đa của tin phải >= giá trị này
        job_type    remote | offline | hybrid
        sort_by     newest | oldest | salary | expired_day
        limit       số tin tối đa (1..500)
    """
    conditions = [
        "j.is_active = TRUE",
        "(j.expiry_date IS NULL OR j.expiry_date >= CURRENT_DATE)",
    ]
    params: dict = {}

    keyword = (criteria.get("keyword") or "").strip()
    if keyword:
        conditions.append(
            "(unaccent(j.title) ILIKE unaccent(:keyword)"
            " OR unaccent(COALESCE(j.role, '')) ILIKE unaccent(:keyword)"
            " OR unaccent(e.emp_name) ILIKE unaccent(:keyword))"
        )
        params["keyword"] = f"%{keyword}%"

    location = (criteria.get("location") or "").strip()
    if location:
        conditions.append("unaccent(COALESCE(j.location, '')) ILIKE unaccent(:location)")
        params["location"] = f"%{location}%"

    if criteria.get("salary_min") is not None:
        conditions.append("COALESCE(j.salary_max, j.salary_min) >= :salary_min")
        params["salary_min"] = criteria["salary_min"]

    if criteria.get("job_type") in SEARCH_JOB_TYPES:
        conditions.append("j.job_type = :job_type")
        params["job_type"] = criteria["job_type"]

    order_clause = SEARCH_SORTS.get(criteria.get("sort_by") or "newest", SEARCH_SORTS["newest"])
    limit = criteria.get("limit") or SEARCH_DEFAULT_LIMIT
    params["limit"] = max(1, min(int(limit), SEARCH_MAX_LIMIT))

    query = (
        "SELECT j.* FROM jobs j JOIN employers e ON e.emp_id = j.employer_id"
        f" WHERE {' AND '.join(conditions)}"
        f" ORDER BY {order_clause}"
        " LIMIT :limit"
    )
    return query, params


def search_job(engine, search_criteria: dict) -> dict:
    """Tìm tin tuyển dụng công khai theo từ khoá, địa điểm, lương, hình thức."""
    try:
        query, params = build_search_query(search_criteria)
        with engine.begin() as connection:
            jobs = [dict(row._mapping) for row in connection.execute(text(query), params)]
            return {"status": True, "jobs": jobs, "count": len(jobs)}
    except Exception as error:
        return {"status": False, "error": str(error)}


def get_job_by_id(engine: Engine, job_id: str) -> dict:
    try:
        with engine.begin() as connection:
            query = text("SELECT * FROM jobs WHERE job_id = :job_id")
            result = connection.execute(query, {"job_id": job_id}).fetchall()
            return {
                "status": True,
                "job": result
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_job_by_emp_id(engine: Engine, employer_id: str) -> dict:
    try:
        with engine.begin() as connection:
            query = text("SELECT * FROM jobs WHERE employer_id = :employer_id")
            result = connection.execute(query, {"employer_id": employer_id}).fetchall()
            return {
                "status": True,
                "job": result
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }
