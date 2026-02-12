import os
from sqlalchemy.engine import Engine
from sqlalchemy import (
    create_engine,
    MetaData,
    Table,
    Column,
    Integer,
    String,
    select,
    exists,
    delete,
    text,
    update
)

metadata = MetaData()

candidates = Table(
    "candidates",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, nullable=False, unique=True),
    Column("name", String, nullable=False),
)


def candidate_exists(engine: Engine, email: str) -> dict:
    try:
        stmt = select(
            exists().where(candidates.c.email == email)
        )

        with engine.connect() as conn:
            result = conn.execute(stmt).scalar()

        return {
            "status": True,
            "exists": bool(result)
        }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_all_candidates(engine):
    """Retrieve all candidates from the database."""
    try:
        with engine.connect() as connection:
            query = text("SELECT * FROM candidates")
            result = connection.execute(query)
            return {
                "status": True,
                "candidates": result.fetchall()
            }
    except Exception as error:
        print(f"Error retrieving candidates: {error}")
        return {
            "status": False,
            "error": str(error)}

def add_new_candidate(engine, candidate_data: dict) -> dict:
    """Add a new candidate to the database."""
    try:
        # Validate required fields
        required_fields = ['full_name', 'dob', 'gender', 'email', 'password', 'phone_number', 'address', 'cid']
        for field in required_fields:
            if field not in candidate_data:
                return {
                    "status": False,
                    "error": f"Missing required field: {field}"
                }
        
        with engine.begin() as connection:

            
            # Insert new candidate
            query = text("""
                INSERT INTO candidates 
                (full_name, dob, gender, email, password, phone_number, address, cid)
                VALUES 
                (:full_name, :dob, :gender, :email, :password, :phone_number, :address, :cid)
            """)
            
            stmt = connection.execute(query, candidate_data)
            
            return {
                "status": True,
                "message": "Candidate added successfully",
            }
            
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }
def delete_candidate(engine: Engine, email: str) -> dict:
    try:
        stmt = delete(candidates).where(
            candidates.c.email == email
        )

        with engine.begin() as conn:
            result = conn.execute(stmt)

        if result.rowcount == 0:
            return {
                "status": True,
                "message": "No candidate found with this email"
            }

        return {
            "status": True,
            "message": f"Candidate with email {email} deleted successfully"
        }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def update_candidate(engine, email: str, update_data: dict) -> dict:
    """
    Update candidate information in the database.
    
    Args:
        engine: SQLAlchemy engine instance
        cid: Citizen ID of the candidate to update
        update_data: Dictionary containing fields to update
        
    Returns:
        Dictionary with status and message/error
    """
    try:
        # List of fields that can be updated
        allowed_fields = ['full_name', 'dob', 'gender', 'password', 'phone_number', 'address']
        
        # Filter only allowed fields from update_data
        fields_to_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not fields_to_update:
            return {
                "status": False,
                "error": "No valid fields to update"
            }
        
        with engine.begin() as connection:
            # Check if candidate exists
            check_query = text("SELECT email FROM candidates WHERE email = :email")
            existing = connection.execute(check_query, {"email": email}).fetchone()
            
            if not existing:
                return {
                    "status": False,
                    "error": "Candidate not found"
                }
            
            
            # Build dynamic UPDATE query with updated_at
            set_clause = ", ".join([f"{field} = :{field}" for field in fields_to_update.keys()])
            query = text(f"""
                UPDATE candidates 
                SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                WHERE email = :email
            """)
            
            # Add email to the parameters
            params = {**fields_to_update, "email": email}
            
            result = connection.execute(query, params)
            
            if result.rowcount == 0:
                return {
                    "status": False,
                    "error": "Update failed"
                }
            
            return {
                "status": True,
                "message": "Candidate updated successfully",
                "updated_fields": list(fields_to_update.keys())
            }
            
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }