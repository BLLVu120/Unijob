from sqlalchemy import exists, text
from db.connection import DB

def main():
    db = DB()
    db_connection = db.connect()
    engine = db_connection["engine"]
    # drop_employers_table(engine)
    # print_table_columns(engine, "employers")
    # create_employers_table(engine)
    exists = check_table_exists(engine, "employers")
    print("Table exists:", exists)

from sqlalchemy import inspect
def check_table_exists(engine, table_name):
    query = text("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = :table_name
        );
    """)

    with engine.connect() as conn:
        result = conn.execute(query, {"table_name": table_name})
        exists = result.scalar()

    return exists
def print_table_columns(engine, table_name):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)

    print(f"Columns in '{table_name}':")
    for col in columns:
        print(col["name"])

    return columns

def drop_employers_table(engine):
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS employers CASCADE;"))
        conn.commit()
        print("Table 'employers' dropped successfully.")


def create_employers_table(engine):
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        """))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS employers (
                emp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                emp_name VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                website VARCHAR(255),
                tax_code VARCHAR(50) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone_number VARCHAR(20),
                description TEXT,
                scope VARCHAR(255),
                representative_name VARCHAR(255) NOT NULL,
                cid VARCHAR(50) NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                status VARCHAR(50) DEFAULT 'active',
                score INTEGER DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))

        conn.commit()
        print("Table 'employers' created successfully.")
# Example usage:
if __name__ == "__main__":
    print(main())