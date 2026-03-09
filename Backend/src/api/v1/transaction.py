from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.db.connection import DB
from src.db.transaction import add_transaction,update_transaction,get_transaction_by_id

router = APIRouter(
    prefix="/transaction",
    tags=["Transaction"]
)

class Transaction(BaseModel):
    transaction_id: Optional[str] = None
    user_id: Optional[str] = None
    amount: Optional[int] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    provider_id: Optional[str] = None


@router.post("/add")
def add_transactions(transaction_data: Transaction):
    
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = add_transaction(engine, transaction_data.dict())
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }

@router.post("/update")
def add_transactions(transaction_data: Transaction):
    
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = update_transaction(engine, transaction_data.dict())
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    
    return {
        "status": True,
        "message": stmt['message']
    }

@router.get("/get_transaction_by_id")
def get_transactions_by_id(id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]
    
    stmt = get_transaction_by_id(engine,id)
    
    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }
    transactions = [dict(row._mapping) for row in stmt["transaction"]]
    return {
        "status": True,
        "transactions": transactions
    }
