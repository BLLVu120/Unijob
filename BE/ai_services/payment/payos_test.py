from payos import PayOS
import os
import sys
from payos.types import CreatePaymentLinkRequest
from dotenv import load_dotenv
import time

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

payOS = PayOS(
    client_id=os.environ.get('PAYOS_CLIENT_ID'),
    api_key=os.environ.get('PAYOS_API_KEY'),
    checksum_key=os.environ.get('PAYOS_CHECKSUM_KEY')
)

# Truyền ngrok URL làm tham số: python payos_test.py https://<id>.ngrok-free.app
# Nếu không truyền, webhook_url để None (PayOS sẽ dùng URL đã đăng ký trên Dashboard)
ngrok_base = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else None
webhook_url = f"{ngrok_base}/webhook/payos" if ngrok_base else None

payment_request = CreatePaymentLinkRequest(
    order_code=int(time.time()),
    amount=2000,
    description="Thanh toán don hang",
    cancel_url="https://unijob.vn/cancel",
    return_url="https://unijob.vn/success",
)

payment_link = payOS.payment_requests.create(payment_request)

print("─" * 50)
print(f"  Link thanh toán : {payment_link.checkout_url}")
if webhook_url:
    print(f"  Webhook URL     : {webhook_url}")
    print("  (Nhớ đăng ký webhook URL nếu chưa làm)")
print("─" * 50)
