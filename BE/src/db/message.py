import logging

from sqlalchemy import text

logger = logging.getLogger(__name__)


def add_message(engine, message_data: dict) -> dict:
    """Add a new message to the database."""
    try:
        # Validate required fields
        required_fields = ['sender_id', 'receiver_id', 'content']
        for field in required_fields:
            if field not in message_data:
                return {
                    "status": False,
                    "error": f"Missing required field: {field}"
                }

        with engine.begin() as connection:
            # Insert new message
            query = text("""
                INSERT INTO messages
                (sender_id, receiver_id, content)
                VALUES
                (:sender_id, :receiver_id, :content)
            """)

            connection.execute(query, message_data)

            return {
                "status": True,
                "message": "Message added successfully",
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }

def get_conversation_by_id(engine, user_id:str) -> dict:
    """Retrieve the conversation between two users."""
    try:
        with engine.begin() as connection:
            query = text("""
                SELECT DISTINCT ON (other_user_id)
                    message_id,
                    sender_id,
                    receiver_id,
                    content,
                    created_at
                FROM (
                    SELECT
                        message_id,
                        sender_id,
                        receiver_id,
                        content,
                        created_at,
                        CASE
                            WHEN sender_id = :current_user_id THEN receiver_id
                            ELSE sender_id
                        END AS other_user_id
                    FROM messages
                    WHERE sender_id = :current_user_id
                    OR receiver_id = :current_user_id
                ) t
                ORDER BY other_user_id, created_at DESC;
            """)

            result = connection.execute(query, {"current_user_id": user_id})
            messages = result.fetchall()

            return {
                "status": True,
                "conversation": messages
            }

    except Exception as error:
        return {
            "status": False,
            "error": str(error)
        }


def get_messages_by_id(engine, user1_id: str, user2_id: str):
    """Retrieve all messages between 2 users."""
    try:
        with engine.connect() as connection:
            query = text("""
                SELECT *
                FROM messages
                WHERE
                    (sender_id = :Uvs1 AND receiver_id = :Uvs2)
                    OR
                    (sender_id = :Uvs2 AND receiver_id = :Uvs1)
                ORDER BY created_at ASC
            """)

            result = connection.execute(
                query,
                {
                    "Uvs1": user1_id,
                    "Uvs2": user2_id
                }
            )

            messages = result.fetchall()  # trả về dict thay vì tuple

            return {
                "status": True,
                "messages": messages
            }

    except Exception as error:
        logger.error("Error retrieving messages: %s", error)
        return {
            "status": False,
            "error": str(error)
        }

