import os
from sqlalchemy.engine import Engine
from sqlalchemy import text

def get_employer_by_email(engine, email: str) -> dict:
    try:
        with engine.connect() as conn:
            query = text("SELECT * FROM employers WHERE email = :email")
            result = conn.execute(query, {"email": email})

            row = result.fetchone()

            if row is not None:
                return {
                    "status": True,
                    "employer": dict(row._mapping)  
                }
            else:
                return {
                    "status": True,
                    "error": "Employer not found"
                }
    except Exception as e:
        return {
            "status": False,
            "error": str(e)
        }
def add_new_employer(engine, employer_data: dict) -> dict:
    try:
        with engine.begin() as conn:
            query = text("""
                INSERT INTO employers 
                (emp_name, address,website, tax_code, email,password, phone_number,description,scope, representative_name, cid)
                VALUES 
                (:emp_name, :address, :website, :tax_code, :email, :password, :phone_number, :description, :scope, :representative_name, :cid)
            """)

            stmt =conn.execute(query, employer_data)
 
            return {
                "status": True,
                "message": "Employer added successfully"
            }

    except Exception as e:
        return {
            "status": False,
            "error": str(e)
        }
def update_employer(engine, email: str, update_data: dict) -> dict:
    try:
        # List of fields that can be updated
        allowed_fields = ['emp_name', 'address', 'website', 'tax_code', 'password', 'phone_number', 'description', 'scope', 'representative_name', 'cid', 'is_verified', 'status', 'score']
        
        # Filter only allowed fields from update_data
        fields_to_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not fields_to_update:
            return {
                "status": False,
                "error": "No valid fields to update"
            }
        
        with engine.begin() as connection:
            # Check if employer exists
            check_query = text("SELECT email FROM employers WHERE email = :email")
            existing = connection.execute(check_query, {"email": email}).fetchone()
            
            if not existing:
                return {
                    "status": False,
                    "error": "Employer not found"
                }
            
            
            # Build dynamic UPDATE query with updated_at
            set_clause = ", ".join([f"{field} = :{field}" for field in fields_to_update.keys()])
            query = text(f"""
                UPDATE employers 
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
                "message": "Employer updated successfully",
                "updated_fields": list(fields_to_update.keys())
            }
            
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }