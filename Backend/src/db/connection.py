import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

class DB:

    def __init__(self):
        """Initialize connection parameters"""
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'unijob_db')
        self.user = os.getenv('DB_USER', 'unijob_user')
        self.password = os.getenv('DB_PASSWORD', 'unijob_password')
        
    def connect(self):
        """Establish a database connection"""
        try:
            # Tạo connection string
            connection_string = f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
            
            # Tạo engine
            engine = create_engine(connection_string, future=True)
            
            # Test connection
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                result.fetchone()
            
            return {
                "engine": engine,
                "status": True,
            }
            
        except Exception as error:
            return {
                "status": False,
                "error": str(error)
            }
    def disconnect(self, engine):
        """Close the database connection"""
        try:
            engine.dispose()
            return {
                "status": True,
            }
        except Exception as error:
            return {
                "status": False,
                "error": str(error)
            }