"""
In-memory OTP store với TTL 5 phút.
Key: email (str) → Value: { otp, created_at }
"""
import time
import random
import string
from typing import Optional

_store: dict = {}

OTP_TTL_SECONDS = 300  # 5 phút


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def save_otp(email: str, otp: str) -> None:
    _store[email] = {"otp": otp, "created_at": time.time()}


def verify_otp(email: str, otp: str) -> bool:
    """
    Kiểm tra OTP hợp lệ và còn trong thời hạn.
    Xóa OTP sau khi xác thực thành công.
    """
    entry = _store.get(email)
    if not entry:
        return False
    if time.time() - entry["created_at"] > OTP_TTL_SECONDS:
        _store.pop(email, None)
        return False
    if entry["otp"] != otp:
        return False
    _store.pop(email, None)
    return True


def has_pending_otp(email: str) -> bool:
    entry = _store.get(email)
    if not entry:
        return False
    if time.time() - entry["created_at"] > OTP_TTL_SECONDS:
        _store.pop(email, None)
        return False
    return True
