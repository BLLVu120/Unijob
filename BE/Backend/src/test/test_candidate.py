from db.candidate import get_candidate_by_email,add_new_candidate,update_candidate
from db.connection import DB


def test_add_new_candidate():
    db = DB()
    connection = db.connect()

    new_candidate = {
        "full_name": "Lap Hoang Van",
        "dob": "2004-09-04",
        "gender": "Male",
        "email": "candidate@example.com",
        "password": "hashed_password_here",
        "phone_number": "0123456789",
        "address": "Binh Thanh, Ho Chi Minh City",
        "cid": "079095001234"
    }
    stmt = add_new_candidate(connection["engine"], new_candidate)
    print(stmt)
    assert stmt["status"] is True

def test_update_candidate():
    db = DB()
    connection = db.connect()

    engine = connection["engine"]
    email = "candidate@example.com"
    update_data = {
        "full_name": "Hoang Van Lap",
        "phone_number": "0987654321",
        "address": "76 Nguyen Xi, Ho Chi Minh City"
    }
    stmt = update_candidate(engine, email, update_data)
    print(stmt)
    assert stmt["status"] is True

def test_get_candidate_by_email():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    email = "candidate@example.com"
    stmt = get_candidate_by_email(engine, email)
    print(stmt)
    assert stmt["status"] is True

if __name__ == "__main__":
    test_get_candidate_by_email()
    test_add_new_candidate()
    test_update_candidate()
    