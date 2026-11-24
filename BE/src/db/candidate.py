from sqlalchemy import text


### CREATE--------------------------------------------------------------------------------
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

            connection.execute(query, candidate_data)

            return {
                "status": True,
                "message": "Candidate added successfully",
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

### READ--------------------------------------------------------------------------------
def get_candidate_by_email(engine, email: str) -> dict:
    """Retrieve a candidate by email from the database."""
    try:
        with engine.connect() as conn:
            query = text("SELECT * FROM candidates WHERE email = :email")
            result = conn.execute(query, {"email": email})

            row = result.fetchone()

            if row is not None:
                return {
                    "status": True,
                    "candidate": dict(row._mapping)
                }
            else:
                return {
                    "status": True,
                    "candidate": []
                }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_candidate_by_id(engine, id: str) -> dict:
    """Retrieve a candidate by email from the database."""
    try:
        with engine.connect() as conn:
            query = text("SELECT * FROM candidates WHERE candidate_id = :candidate_id")
            result = conn.execute(query, {"candidate_id": id})

            row = result.fetchone()

            if row is not None:
                return {
                    "status": True,
                    "candidate": dict(row._mapping)
                }
            else:
                return {
                    "status": True,
                    "candidate": []
                }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

### UPDATE--------------------------------------------------------------------------------
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
        allowed_fields = ['dob', 'gender', 'password', 'phone_number', 'address','is_verified']

        # Filter only allowed fields from update_data
        fields_to_update = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}

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

### DELETE--------------------------------------------------------------------------------
def delete_candidate(engine, email: str) -> dict:
    """Delete a candidate from the database by email."""
    try:
        with engine.begin() as connection:
            query = text("DELETE FROM candidates WHERE email = :email")
            result = connection.execute(query, {"email": email})

            if result.rowcount > 0:
                return {
                    "status": True,
                    "message": "Candidate deleted successfully"
                }
            else:
                return {
                    "status": True,
                    "error": "Candidate not found"
                }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }
