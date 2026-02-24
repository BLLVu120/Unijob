from db.admin import get_all_candidates,delete_candidate,get_all_employers
from db.connection import DB
def test_get_all_candidates():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_candidates(engine)
    for candidate in stmt["candidates"]:
        print(candidate)
    assert stmt["status"] is True

def test_delete_candidate():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    email = "candidate@example.com"
    stmt = delete_candidate(engine, email)
    print(stmt)    
    assert stmt["status"] is True
def test_get_all_employers():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_all_employers(engine)
    for employer in stmt["employers"]:
        print(employer)
    assert stmt["status"] is True

if __name__ == "__main__":
    # test_get_all_candidates()
    # test_delete_candidate()
    test_get_all_employers()