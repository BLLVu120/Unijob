from db.candidate import get_all_candidates
from db.connection import DB
def test_get_all_candidates():
    db = DB()
    connection = db.connect()

    engine = connection["engine"]
    stmt = get_all_candidates(engine)
    for candidate in stmt["candidates"]:
        print(candidate)
    assert stmt["status"] is True

if __name__ == "__main__":
    test_get_all_candidates()