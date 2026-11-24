"""
Thanh toán qua VNPay (môi trường Sandbox).

Luồng:
  1. FE gọi POST /v1/payment/create_payment_link → BE tạo URL thanh toán VNPay đã ký (HMAC-SHA512).
  2. Người dùng thanh toán trên trang VNPay.
  3. VNPay chuyển về return_url kèm các tham số vnp_*.
  4. FE gửi các tham số đó tới POST /v1/payment/verify_return → BE kiểm tra chữ ký
     và trả về giao dịch có thành công hay không.

Cấu hình (.env):
  VNPAY_TMN_CODE     mã website (Terminal ID) do VNPay cấp khi đăng ký sandbox
  VNPAY_HASH_SECRET  chuỗi bí mật dùng để ký
  VNPAY_URL          (tuỳ chọn) mặc định là cổng sandbox

Đăng ký tài khoản sandbox: https://sandbox.vnpayment.vn/devreg/
Lưu ý: chưa có IPN (VNPay gọi thẳng về server) vì cần URL public; khi lên production nên bổ sung.
"""
import hashlib
import hmac
import os
import random
import unicodedata
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)

VNPAY_SANDBOX_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VN_TZ = timezone(timedelta(hours=7))


def _config():
    return (
        os.environ.get("VNPAY_TMN_CODE", "").strip(),
        os.environ.get("VNPAY_HASH_SECRET", "").strip(),
        os.environ.get("VNPAY_URL", VNPAY_SANDBOX_URL).strip() or VNPAY_SANDBOX_URL,
    )


def _sign(params: Dict[str, str], secret: str):
    """Sắp xếp tham số theo tên, mã hoá giá trị (quote_plus) rồi ký HMAC-SHA512 — đúng chuẩn VNPay 2.1.0."""
    query = "&".join(
        f"{key}={urllib.parse.quote_plus(str(value))}"
        for key, value in sorted(params.items())
        if value is not None and str(value) != ""
    )
    secure_hash = hmac.new(secret.encode("utf-8"), query.encode("utf-8"), hashlib.sha512).hexdigest()
    return query, secure_hash


def _ascii(text: str, limit: int = 255) -> str:
    """VNPay khuyến nghị nội dung đơn hàng không dấu."""
    text = (text or "").replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return " ".join(text.split())[:limit] or "Thanh toan Unijob"


class CreatePaymentRequest(BaseModel):
    amount: int
    description: str
    return_url: str
    cancel_url: Optional[str] = None  # giữ để tương thích, VNPay chỉ dùng return_url


class VerifyReturnRequest(BaseModel):
    query: Dict[str, str]


@router.post("/create_payment_link")
def create_payment_link(body: CreatePaymentRequest, request: Request):
    tmn_code, hash_secret, pay_url = _config()
    if not tmn_code or not hash_secret:
        return JSONResponse(
            status_code=403,
            content={"status": False, "error": "Chưa cấu hình VNPay (VNPAY_TMN_CODE / VNPAY_HASH_SECRET trong .env)"}
        )
    if body.amount < 5000:
        return JSONResponse(status_code=403, content={"status": False, "error": "Số tiền tối thiểu là 5.000đ"})

    now = datetime.now(VN_TZ)
    txn_ref = f"{now:%Y%m%d%H%M%S}{random.randint(100, 999)}"
    params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": tmn_code,
        "vnp_Amount": str(body.amount * 100),  # VNPay tính theo đơn vị x100
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": _ascii(body.description),
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": body.return_url,
        "vnp_IpAddr": (request.client.host if request.client else None) or "127.0.0.1",
        "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
        "vnp_ExpireDate": (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S"),
    }
    query, secure_hash = _sign(params, hash_secret)
    return {
        "status": True,
        "checkoutUrl": f"{pay_url}?{query}&vnp_SecureHash={secure_hash}",
        "orderCode": txn_ref,
    }


@router.post("/verify_return")
def verify_return(body: VerifyReturnRequest):
    """Kiểm tra chữ ký các tham số VNPay gửi về return_url."""
    _, hash_secret, _ = _config()
    if not hash_secret:
        return JSONResponse(status_code=403, content={"status": False, "error": "Chưa cấu hình VNPay"})

    received_hash = body.query.get("vnp_SecureHash", "")
    params = {
        key: value for key, value in body.query.items()
        if key.startswith("vnp_") and key not in ("vnp_SecureHash", "vnp_SecureHashType")
    }
    _, expected_hash = _sign(params, hash_secret)
    valid = bool(received_hash) and hmac.compare_digest(expected_hash.lower(), received_hash.lower())
    paid = valid and params.get("vnp_ResponseCode") == "00" and params.get("vnp_TransactionStatus") == "00"

    try:
        amount = int(params.get("vnp_Amount", "0")) // 100
    except ValueError:
        amount = 0

    return {
        "status": True,
        "valid": valid,
        "paid": paid,
        "orderCode": params.get("vnp_TxnRef"),
        "amount": amount,
        "responseCode": params.get("vnp_ResponseCode"),
        "bankCode": params.get("vnp_BankCode"),
        "transactionNo": params.get("vnp_TransactionNo"),
    }
