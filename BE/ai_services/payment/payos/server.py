import os
import random

from payos import PayOS
from payos.type import PaymentData
from fastapi import FastAPI
from fastapi.responses import JSONResponse, HTMLResponse

payOS = PayOS(
    client_id=os.environ.get("PAYOS_CLIENT_ID"),
    api_key=os.environ.get("PAYOS_API_KEY"),
    checksum_key=os.environ.get("PAYOS_CHECKSUM_KEY"),
)

app = FastAPI()

DOMAIN = "http://127.0.0.1:8000"


@app.post("/create_payment_link")
async def create_payment():
    try:
        payment_data = PaymentData(
            orderCode=random.randint(1000, 99999),
            amount=2000,
            description="demo",
            cancelUrl=f"{DOMAIN}/payment/cancel",
            returnUrl=f"{DOMAIN}/payment/success",
        )
        payos_create_payment = payOS.createPaymentLink(payment_data)
        return JSONResponse(content=payos_create_payment.to_json())
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=403)


@app.get("/payment/success", response_class=HTMLResponse)
async def payment_success():
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
            a { display: inline-block; padding: 10px 24px; background: #16a34a; color: white; border-radius: 8px; text-decoration: none; }
            a:hover { background: #15803d; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">✅</div>
            <h1>Thanh toán thành công!</h1>
            <p>Giao dịch của bạn đã được xử lý thành công.</p>
            <a href="/">Quay về trang chủ</a>
        </div>
    </body>
    </html>
    """)


@app.get("/payment/cancel", response_class=HTMLResponse)
async def payment_cancel():
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
            a { display: inline-block; padding: 10px 24px; background: #dc2626; color: white; border-radius: 8px; text-decoration: none; }
            a:hover { background: #b91c1c; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">❌</div>
            <h1>Thanh toán bị huỷ!</h1>
            <p>Bạn đã huỷ giao dịch. Vui lòng thử lại nếu muốn.</p>
            <a href="/">Thử lại</a>
        </div>
    </body>
    </html>
    """)
