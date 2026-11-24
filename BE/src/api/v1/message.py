
from fastapi import APIRouter
from pydantic import BaseModel

from src.db.connection import DB
from src.db.message import add_message, get_conversation_by_id, get_messages_by_id

router = APIRouter(
    prefix="/message",
    tags=["Message"]
)

class Message(BaseModel):
    sender_id: str
    receiver_id: str
    content: str


@router.post("/add_message")
def add_messages(message_data: Message):

    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = add_message(engine, message_data.dict())

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    return {
        "status": True,
        "message": stmt['message']
    }

@router.get("/get_conversation_by_id")
def get_conversation(user_id: str):

    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_conversation_by_id(engine, user_id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    conversations = [dict(row._mapping) for row in stmt["conversation"]]
    return {
        "status": True,
        "feedback": conversations
    }

@router.get("/get_messages_by_id")
def get_messages(user1_id: str,user2_id: str):
    db = DB()
    connection = db.connect()
    engine = connection["engine"]

    stmt = get_messages_by_id(engine, user1_id,user2_id)

    if stmt['status'] is False:
        return {
            "status": False,
            "error": stmt['error']
        }

    messages = [dict(row._mapping) for row in stmt["messages"]]
    return {
        "status": True,
        "messages": messages
    }
