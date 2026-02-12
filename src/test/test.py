from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()

def test_query():
    # Example function to demonstrate a test query
    return {"status": "success", "data": "Test query executed"} 

# Example usage:
if __name__ == "__main__":
    from sqlalchemy import create_engine
    
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    database = os.getenv('DB_NAME', 'unijob')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', 'password')
    
    connection_string = f"postgresql://{user}:{password}@{host}:{port}/{database}"

    # Create engine (replace with your database URL)
    engine = create_engine(connection_string)
    
    result = test_query()
    print(result)