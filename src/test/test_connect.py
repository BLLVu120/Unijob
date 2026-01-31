from db.connection import DB

def test_db_connection():
    db = DB()
    connection = db.connect()
    print(connection)
    assert connection["status"] is True

if __name__ == "__main__":
    test_db_connection()

