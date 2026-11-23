from db.connection import DB

def test_db_connection():
    db = DB()
    connection = db.connect()
    print(connection)
    assert connection["status"] is True

def test_db_disconnection():
    db = DB()
    connection = db.connect()
    print(connection)
    assert connection["status"] is True

    engine = connection["engine"]
    disconnection = db.disconnect(engine)
    print(disconnection)
    assert disconnection["status"] is True

if __name__ == "__main__":
    test_db_connection()
    test_db_disconnection()

