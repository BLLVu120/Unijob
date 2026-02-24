from db.connection import DB
from db.emp import get_employer_by_email,add_new_employer, update_employer

def test_get_employer_by_email():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    email = "candidate@example.com"
    stmt = get_employer_by_email(engine, email)    
    print(stmt)
    assert stmt["status"] is True
def test_add_new_employer():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    employer_data = {
        "emp_name": "TestEmployer",
        "address": "123 Test Street",
        "website": "https://testemployer.com",
        "tax_code": "TAX123456",
        "email": "candidate@example.com",
        "password": "securepassword",
        "phone_number": "1234567890",
        "description": "This is a test employer",    
        "scope": "Test Scope",
        "representative_name": "John Doe",    
        "cid": "123456789"
    }
    stmt = add_new_employer(engine, employer_data)
    print(stmt)
    assert stmt["status"] is True

def test_update_employer_info():
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    update_data = {
        "emp_name": "Updated Test Employer",
        "address": "456 Updated Street",
        "website": "https://updatedtestemployer.com",
        "tax_code": "TAX654321",
        "email": "candidate@example.com",
        "password": "updatedsecurepassword",
        "phone_number": "0987654321",
        "description": "This is an updated test employer",    
        "scope": "Updated Test Scope",
        "representative_name": "Jane Doe",    
        "cid": "987654321",
        "is_verified": True,
        "status": "inactive",
        "score": 95.5
    }
    stmt = update_employer(engine, update_data["email"], update_data)
    print(stmt)
    assert stmt["status"] is True

if __name__ == "__main__":
    test_get_employer_by_email()
    test_add_new_employer()
    test_update_employer_info()