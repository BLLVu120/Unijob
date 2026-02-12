from db.candidate import delete_candidate,candidate_exists,add_new_candidate,update_candidate
from db.connection import DB


def test_candidate_existence():
    db = DB()
    connection = db.connect()

    engine = connection["engine"]
    email = "nguyenvana@example.com"
    
    stmt = candidate_exists(engine, email)
    print(stmt)
    assert stmt["status"] is True

def test_delete_candidate():
    db = DB()
    connection = db.connect()

    engine = connection["engine"]
    stmt = delete_candidate(engine, email="newemail@example.com")
    print(stmt)
    assert stmt["status"] is True

def test_add_new_candidate():
    db = DB()
    connection = db.connect()

    new_candidate = {
        "full_name": "Lap Hoang Van",
        "dob": "2004-09-04",
        "gender": "Male",
        "email": "candidate@example.com",
        "password": "hashed_password_here",  # Remember to hash password before storing
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
        "address": "123 Le Loi, Ho Chi Minh City"
    }
    stmt = update_candidate(engine, email, update_data)
    print(stmt)
    assert stmt["status"] is True

if __name__ == "__main__":
    test_candidate_existence()
    test_delete_candidate()
    test_add_new_candidate()
    test_update_candidate()