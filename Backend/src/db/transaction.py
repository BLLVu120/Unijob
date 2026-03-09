from sqlalchemy.engine import Engine
from sqlalchemy import text
from src.utils.sql_builder import build_insert_parts

def add_transaction(engine, transaction_data: dict) -> dict:
    try:
        with engine.begin() as connection:
            _,col_clause,val_clause = build_insert_parts(transaction_data)
            
            query = text(f"INSERT INTO transactions ({col_clause}) VALUES ({val_clause})")
            connection.execute(query, transaction_data)
            return {
                "status": True,
                "message": "Transactions added successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def update_transaction(engine, update_data: dict) -> dict:
    try:
        with engine.begin() as connection:
            
            set_clause = ", ".join([f"{field} = :{field}" for field in update_data.keys() if update_data[field] is not None])
                        
            query = text(f"""UPDATE transactions 
                         SET {set_clause} 
                         WHERE transaction_id = :transaction_id""")
            connection.execute(query, {**update_data, "transaction_id": update_data['transaction_id']})
            return {
                "status": True,
                "message": "Transaction updated successfully"
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_transaction_by_id(engine: Engine, user_id: str) -> dict:
    try:
        with engine.begin() as connection:
            query = text("SELECT * FROM transactions WHERE user_id = :user_id")
            result = connection.execute(query, {"user_id": user_id}).fetchall()
            return {
                "status": True,
                "transaction": result
            }
    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }