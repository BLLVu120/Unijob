from db.job import add_job
from db.connection import DB
def test_add_job():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    job_data = {
        "employer_id": "c6cb5776-8a4e-4003-85fa-1f5bc7030da3",
        "title": "Software Engineer",
        "description": "We are looking for a skilled software engineer to join our team.",
        "requirements": "Bachelor's degree in Computer Science or related field, 3+ years of experience in software development.",
        "benefits": "Health insurance, 401(k), flexible working hours.",
        "salary_min": 60000,
        "salary_max": 90000,
        "location": "New York, NY",
        "is_remote": False,
        "expiry_date": "2024-12-31",
        "status": "active"
    }
    
    stmt = add_job(engine, job_data)
    print(stmt)
    # assert stmt["status"] is True

if __name__ == "__main__":
    test_add_job()