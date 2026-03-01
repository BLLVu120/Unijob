from sqlalchemy.engine import Engine
from sqlalchemy import text

def add_job(engine, job_data: dict) -> dict:
    """Add a new job to the database."""
    try:
        with engine.begin() as connection:
            query = text("INSERT INTO jobs (employer_id,title, description,requirements,benefits, salary_min, salary_max, location, is_remote,expiry_date,status) VALUES (:employer_id,:title, :description, :requirements, :benefits, :salary_min, :salary_max, :location, :is_remote,:expiry_date,:status)")
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
            set_clause = ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            query = text(f"UPDATE jobs SET {set_clause} WHERE job_id = :job_id")
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

def search_job(engine, search_criteria: dict) -> dict:
    """
    Search jobs based on keyword, location, salary, remote option.

    sort_by options:
        - newest
        - salary
        - expired_day
    """

    try:
        with engine.begin() as connection:

            conditions = []
            params = {}

            # default active jobs
            conditions.append("status = 'active'")

            # keyword search
            if "keyword" in search_criteria and search_criteria["keyword"]:
                conditions.append("""
                    (
                        title ILIKE :keyword OR
                        description ILIKE :keyword OR
                        requirements ILIKE :keyword
                    )
                """)
                params["keyword"] = f"%{search_criteria['keyword']}%"

            # location filter
            if "location" in search_criteria and search_criteria["location"]:
                conditions.append("location ILIKE :location")
                params["location"] = f"%{search_criteria['location']}%"

            # salary min filter
            if "salary_min" in search_criteria and search_criteria["salary_min"] is not None:
                conditions.append("salary_max >= :salary_min")
                params["salary_min"] = search_criteria["salary_min"]
            

            # remote filter
            if "is_remote" in search_criteria and search_criteria["is_remote"] is not None:
                conditions.append("is_remote = :is_remote")
                params["is_remote"] = search_criteria["is_remote"]

            # build WHERE
            where_clause = " AND ".join(conditions)

            # sorting
            sort_by = search_criteria.get("sort_by", "newest")
            if sort_by == "salary":
                order_clause = "ORDER BY salary_max DESC"

            elif sort_by == "expired_day":
                order_clause = "ORDER BY expiry_date ASC"

            else:  # newest
                order_clause = "ORDER BY created_at DESC"

            params["limit"] = search_criteria.get("limit", 10)

            query = text(f"""
                SELECT
                    job_id,
                    employer_id,
                    title,
                    description,
                    requirements,
                    benefits,
                    salary_min,
                    salary_max,
                    location,
                    is_remote,
                    expiry_date,
                    status
                FROM jobs
                WHERE {where_clause}
                {order_clause}
                LIMIT :limit
            """)
            print(query)
            result = connection.execute(query, params)

            jobs = [dict(row._mapping) for row in result]

            return {
                "status": True,
                "jobs": jobs,
                "count": len(jobs)
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }