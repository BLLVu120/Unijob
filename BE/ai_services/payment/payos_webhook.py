"""
PayOS Webhook Server
─────────────────────────────────────────────────────────────────────────────
Nhận callback từ PayOS khi thanh toán thành công / thất bại.

Cách dùng:
  1. Chạy server:
       conda activate exe_env
       cd payment
       uvicorn payos_webhook:app --port 8001 --reload

  2. Expose ra internet bằng ngrok:
       ngrok http 8001

  3. Đăng ký Webhook URL trên PayOS Dashboard:
       https://my.payos.vn → Developer → Webhook
       URL: https://<ngrok-id>.ngrok-free.app/webhook/payos

  4. Hoặc đăng ký bằng code (chạy 1 lần):
       python payos_webhook.py --register https://<ngrok-id>.ngrok-free.app
─────────────────────────────────────────────────────────────────────────────
"""

import os
import sys
import json
import logging
from datetime import datetime

import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from payos import PayOS
from payos.types import WebhookData

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("payos-webhook")

payOS = PayOS(
    client_id=os.environ["PAYOS_CLIENT_ID"],
    api_key=os.environ["PAYOS_API_KEY"],
    checksum_key=os.environ["PAYOS_CHECKSUM_KEY"],
)

app = FastAPI(title="PayOS Webhook Server")


def _notify(event: str, data: dict):
    """In thông báo rõ ràng ra console."""
    sep = "─" * 60
    print(f"\n{sep}")
    print(f"  🔔  {event}  —  {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}")
    for k, v in data.items():
        print(f"      {k:<28} {v}")
    print(sep)


@app.post("/webhook/payos")
async def payos_webhook(request: Request):
    """
    Endpoint nhận callback từ PayOS.
    PayOS gửi POST với JSON body chứa data + signature.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    log.info("Nhận webhook: %s", json.dumps(body, ensure_ascii=False))

    # Xác thực chữ ký từ PayOS
    try:
        webhook_data = WebhookData(**body)
        verified = payOS.verifyPaymentWebhookData(webhook_data)
    except Exception as e:
        log.warning("Xác thực webhook thất bại: %s", e)
        raise HTTPException(status_code=400, detail=f"Webhook verification failed: {e}")

    order_code = verified.orderCode
    amount     = verified.amount
    desc       = verified.description
    status_code = body.get("code", "??")

    if status_code == "00":
        _notify(
            "THANH TOÁN THÀNH CÔNG ✅",
            {
                "Mã đơn hàng (orderCode)": order_code,
                "Số tiền (VND)":           f"{amount:,}",
                "Nội dung":                desc,
                "Thời điểm":               verified.transactionDateTime,
                "Tài khoản đối ứng":       verified.counterAccountNumber or "—",
                "Tên đối ứng":             verified.counterAccountName    or "—",
            },
        )
    else:
        _notify(
            f"THANH TOÁN THẤT BẠI ❌  (code={status_code})",
            {
                "Mã đơn hàng (orderCode)": order_code,
                "Số tiền (VND)":           f"{amount:,}",
                "Nội dung":                desc,
                "Mô tả lỗi":               body.get("desc", ""),
            },
        )

    # PayOS yêu cầu response {"code":"00"} để biết đã nhận thành công
    return JSONResponse({"code": "00", "message": "Webhook received"})


@app.get("/")
def health():
    return {"status": "ok", "message": "PayOS webhook server đang chạy"}


# ─── Đăng ký webhook URL qua code ─────────────────────────────────────────────
if __name__ == "__main__":
    if "--register" in sys.argv:
        idx = sys.argv.index("--register")
        base_url = sys.argv[idx + 1].rstrip("/")
        webhook_url = f"{base_url}/webhook/payos"
        try:
            result = payOS.confirmWebhook(webhook_url)
            print(f"✅  Đăng ký webhook thành công: {webhook_url}")
            print(f"    Kết quả: {result}")
        except Exception as e:
            print(f"❌  Đăng ký webhook thất bại: {e}")
    else:
        uvicorn.run("payos_webhook:app", host="0.0.0.0", port=8001, reload=True)
