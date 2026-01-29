"""
Test connection to PostgreSQL database
"""
import os
import psycopg2
from psycopg2 import sql
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class PostgreSQLConnection:
    """Class để kết nối và quản lý PostgreSQL"""
    
    def __init__(self):
        """Initialize connection parameters"""
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'unijob')
        self.user = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', 'password')
    
    def connect_psycopg2(self):
        """
        Kết nối đến PostgreSQL sử dụng psycopg2
        
        Returns:
            connection: PostgreSQL connection object
        """
        try:
            connection = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password
            )
            print("✓ Kết nối thành công với PostgreSQL (psycopg2)")
            return connection
        except (Exception, psycopg2.Error) as error:
            print(f"✗ Lỗi khi kết nối: {error}")
            return None
    
    def connect_sqlalchemy(self):
        """
        Kết nối đến PostgreSQL sử dụng SQLAlchemy
        
        Returns:
            engine: SQLAlchemy engine object
        """
        try:
            # Tạo connection string
            connection_string = f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
            
            # Tạo engine
            engine = create_engine(connection_string)
            
            # Test connection
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                result.fetchone()
            
            print("✓ Kết nối thành công với PostgreSQL (SQLAlchemy)")
            return engine
        except Exception as error:
            print(f"✗ Lỗi khi kết nối: {error}")
            return None
    
    def execute_query_psycopg2(self, connection, query):
        """
        Thực thi câu lệnh SQL sử dụng psycopg2
        
        Args:
            connection: PostgreSQL connection object
            query: SQL query string
            
        Returns:
            results: Query results
        """
        try:
            cursor = connection.cursor()
            cursor.execute(query)
            
            # Nếu là SELECT, trả về kết quả
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                cursor.close()
                return results
            else:
                connection.commit()
                cursor.close()
                return "✓ Thực thi thành công"
        except (Exception, psycopg2.Error) as error:
            print(f"✗ Lỗi khi thực thi: {error}")
            return None
    
    def close_connection(self, connection):
        """
        Đóng kết nối PostgreSQL
        
        Args:
            connection: PostgreSQL connection object
        """
        if connection:
            connection.close()
            print("✓ Đã đóng kết nối")


def test_psycopg2():
    """Test kết nối với psycopg2"""
    print("\n=== Test kết nối psycopg2 ===")
    db = PostgreSQLConnection()
    conn = db.connect_psycopg2()
    
    if conn:
        # Test execute query
        result = db.execute_query_psycopg2(conn, "SELECT version();")
        if result:
            print(f"PostgreSQL Version: {result[0][0]}\n")
        db.close_connection(conn)


def test_sqlalchemy():
    """Test kết nối với SQLAlchemy"""
    print("\n=== Test kết nối SQLAlchemy ===")
    db = PostgreSQLConnection()
    engine = db.connect_sqlalchemy()
    
    if engine:
        try:
            # Test execute query
            with engine.connect() as connection:
                result = connection.execute(text("SELECT version();"))
                version = result.fetchone()[0]
                print(f"PostgreSQL Version: {version}\n")
        except Exception as e:
            print(f"✗ Lỗi: {e}")
def test_query():
    """Test thực thi câu lệnh SQL"""
    print("\n=== Test thực thi câu lệnh SQL ===")
    db = PostgreSQLConnection()
    conn = db.connect_psycopg2()
    
    if conn:       
        # Thêm data
        insert_query = "INSERT INTO candidates (full_name, email, phone_number,password) VALUES ('Nguyen Van A', 'a.nguyen@unijob', '0901234567', 'password123'), ('Nguyen Van B', 'b.nguyen@unijob', '0901234568', 'password456');"
        db.execute_query_psycopg2(conn, insert_query)
        
        # Truy vấn dữ liệu
        select_query = "SELECT * FROM candidates;"
        results = db.execute_query_psycopg2(conn, select_query)
        print("Dữ liệu trong candidates:")
        for row in results:
            print(row)
        
        db.close_connection(conn)
if __name__ == "__main__":
    # Test các cách kết nối
    test_psycopg2()
    test_sqlalchemy()
    test_query()
