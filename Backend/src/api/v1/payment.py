import os
import random

from fastapi import APIRouter
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from payos import PayOS
from payos.type import PaymentData

router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)

payOS = PayOS(
    client_id=os.environ.get("PAYOS_CLIENT_ID"),
    api_key=os.environ.get("PAYOS_API_KEY"),
    checksum_key=os.environ.get("PAYOS_CHECKSUM_KEY"),
)


class CreatePaymentRequest(BaseModel):
    amount: int
    description: str
    return_url: str
    cancel_url: str


@router.post("/create_payment_link")
def create_payment_link(body: CreatePaymentRequest):
    try:
        payment_data = PaymentData(
            orderCode=random.randint(1000, 9999999),
            amount=body.amount,
            description=body.description,
            cancelUrl=body.cancel_url,
            returnUrl=body.return_url,
        )
        result = payOS.createPaymentLink(payment_data)
        return {
            "status": True,
            "checkoutUrl": result.checkoutUrl,
            "orderCode": result.orderCode,
            "paymentLinkId": result.paymentLinkId,
        }
    except Exception as e:
        return JSONResponse(
            status_code=403,
            content={"status": False, "error": str(e)}
        )


@router.get("/success", response_class=HTMLResponse)
def payment_success():
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Thanh toán thành công</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; }
            .card { text-align: center; background: white; padding: 48px 64px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .icon { font-size: 64px; }
            h1 { color: #16a34a; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 0 0 24px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">✅</div>
            <h1>Thanh toán thành công!</h1>
            <p>Giao dịch của bạn đã được xử lý thành công.</p>
        </div>
    </body>
    </html>
    """)


@router.get("/cancel", response_class=HTMLResponse)
def payment_cancel():
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Thanh toán bị huỷ</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fef2f2; }
            .card { text-align: center; background: white; padding: 48px 64px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .icon { font-size: 64px; }
            h1 { color: #dc2626; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 0 0 24px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">❌</div>
            <h1>Thanh toán bị huỷ!</h1>
            <p>Bạn đã huỷ giao dịch. Vui lòng thử lại nếu muốn.</p>
        </div>
    </body>
    </html>
    """)
