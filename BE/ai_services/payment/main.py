import sys
import os
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from payment.sepay_client import SePayWebhookClient
from apis.schemas.payment import (
    CreatePaymentRequest,
    CreatePaymentResponse,
    WebhookResponse,
    PaymentStatusResponse,
)

# ── Logger có màu cho terminal ────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("payment")

RESET  = "\033[0m"
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"


def _print_paid_banner(payment_code: str, amount: int, txn_date: str, ref: str):
    print(f"\n{GREEN}{BOLD}" + "═" * 60)
    print(f"  ✅  THANH TOÁN THÀNH CÔNG")
    print("═" * 60 + RESET)
    print(f"{GREEN}  Mã đơn   : {BOLD}{payment_code}{RESET}")
    print(f"{GREEN}  Số tiền  : {BOLD}{amount:,} VND{RESET}")
    print(f"{GREEN}  Thời gian: {txn_date}{RESET}")
    print(f"{GREEN}  Ref      : {ref}{RESET}")
    print(f"{GREEN}{BOLD}" + "═" * 60 + f"{RESET}\n")


def _print_webhook_ignored(reason: str):
    print(f"{YELLOW}[Webhook] Bỏ qua: {reason}{RESET}")


def _print_webhook_unauthorized():
    print(f"{RED}{BOLD}[Webhook] ⚠ Authorization sai — yêu cầu bị từ chối{RESET}")


# ── In-memory payment store ───────────────────────────────────────────────────
# { payment_code: { status, amount, created_at, paid_at, transaction } }
payment_store: dict[str, dict] = {}

# Set các code đã in banner — tránh in lặp mỗi lần poll
_notified: set[str] = {}


app = FastAPI(
    title="Unijob Payment API",
    description="API thanh toán chuyển khoản tự động qua SePay Webhook",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = SePayWebhookClient()

CHECKOUT_HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "checkout.html")


@app.get("/", response_class=FileResponse)
async def checkout_page():
    """Trang thanh toán — mở trực tiếp trên trình duyệt."""
    return FileResponse(CHECKOUT_HTML)


# ── Tạo đơn thanh toán ────────────────────────────────────────────────────────

@app.post("/api/payment/create", response_model=CreatePaymentResponse)
async def create_payment(request: CreatePaymentRequest):
    """
    Tạo đơn thanh toán mới và lưu vào bộ nhớ với trạng thái `pending`.
    """
    order = client.create_payment_order(
        amount=request.amount,
        order_id=request.order_id,
        extra_description=request.extra_description,
    )

    payment_store[order.payment_code] = {
        "status": "pending",
        "amount": order.order_amount,
        "created_at": datetime.now().isoformat(),
        "paid_at": None,
        "transaction": None,
    }

    print(f"{CYAN}[Payment] Đơn mới: {BOLD}{order.payment_code}{RESET}"
          f"{CYAN} — {order.order_amount:,} VND{RESET}")

    return CreatePaymentResponse(
        payment_code=order.payment_code,
        order_amount=order.order_amount,
        qr_image_url=order.qr_image_url,
        qr_embed_html=order.qr_embed_html,
        account_number=order.account_number,
        account_name=order.account_name,
        bank_code=order.bank_code,
        instruction=order.instruction,
    )


# ── Trang QR với auto-poll ────────────────────────────────────────────────────

@app.get("/api/payment/qr/preview", response_class=HTMLResponse)
async def preview_qr(
    amount: int,
    payment_code: Optional[str] = None,
    order_id: Optional[str] = None,
):
    """
    Trang QR thanh toán — tự động kiểm tra trạng thái mỗi 3 giây.
    Khi chuyển khoản thành công, trang chuyển sang màn hình xác nhận.
    """
    if not payment_code:
        order = client.create_payment_order(amount=amount, order_id=order_id)
        payment_code = order.payment_code
        payment_store[payment_code] = {
            "status": "pending",
            "amount": amount,
            "created_at": datetime.now().isoformat(),
            "paid_at": None,
            "transaction": None,
        }
        print(f"{CYAN}[Payment] Đơn mới (QR preview): {BOLD}{payment_code}{RESET}"
              f"{CYAN} — {amount:,} VND{RESET}")

    qr_url = client._build_qr_url(amount, payment_code)
    status_url = f"/api/payment/status/{payment_code}"

    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thanh toán — Unijob</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0f4f8;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }}
    .card {{
      background: white; border-radius: 20px; padding: 32px 28px;
      box-shadow: 0 8px 32px rgba(0,0,0,.10); text-align: center;
      max-width: 360px; width: 100%;
    }}
    .logo {{ font-size: 1.3rem; font-weight: 700; color: #2563eb; margin-bottom: 2px; }}
    .subtitle {{ color: #64748b; font-size: .82rem; margin-bottom: 20px; }}
    .qr-wrap {{
      background: #f8fafc; border-radius: 12px; padding: 14px;
      display: inline-block; margin-bottom: 16px; position: relative;
    }}
    .qr-wrap img {{ width: 200px; height: 200px; display: block; }}
    .amount {{ font-size: 1.7rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }}
    .bank-info {{ color: #475569; font-size: .88rem; margin-bottom: 14px; }}
    .code-box {{
      background: #eff6ff; border: 1.5px dashed #2563eb;
      border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
    }}
    .code-label {{ font-size: .72rem; color: #64748b; margin-bottom: 3px; }}
    .code-value {{ font-size: 1.2rem; font-weight: 700; color: #1d4ed8; letter-spacing: .06em; }}
    .notice {{ background: #fefce8; border-radius: 8px; padding: 9px 11px;
               font-size: .78rem; color: #854d0e; text-align: left; margin-bottom: 14px; }}
    .status-bar {{
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: .82rem; color: #64748b; padding: 8px 0;
    }}
    .dot {{
      width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;
      animation: pulse 1.2s ease-in-out infinite;
    }}
    @keyframes pulse {{ 0%,100%{{opacity:1}} 50%{{opacity:.3}} }}

    /* ── Màn hình thành công ── */
    .success-screen {{
      display: none; flex-direction: column; align-items: center;
      justify-content: center; padding: 20px;
    }}
    .checkmark {{
      width: 80px; height: 80px; border-radius: 50%;
      background: #22c55e; display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; margin-bottom: 16px;
      animation: pop .4s cubic-bezier(.175,.885,.32,1.275);
    }}
    @keyframes pop {{ 0%{{transform:scale(0)}} 100%{{transform:scale(1)}} }}
    .success-title {{ font-size: 1.4rem; font-weight: 700; color: #15803d; margin-bottom: 6px; }}
    .success-amount {{ font-size: 2rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }}
    .success-code {{ font-size: .85rem; color: #64748b; margin-bottom: 16px; }}
    .success-time {{ font-size: .78rem; color: #94a3b8; }}
    .tag {{
      background: #dcfce7; color: #166534; font-size: .75rem; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; margin-top: 10px;
    }}
  </style>
</head>
<body>
<div class="card" id="card">

  <!-- Màn hình chờ thanh toán -->
  <div id="waiting">
    <div class="logo">Unijob</div>
    <div class="subtitle">Quét mã QR để thanh toán</div>

    <div class="qr-wrap">
      <img src="{qr_url}" alt="QR thanh toán"/>
    </div>

    <div class="amount">{amount:,} VND</div>
    <div class="bank-info">
      {client.bank_code} — {client.account_number}<br/>
      <strong>{client.account_name}</strong>
    </div>

    <div class="code-box">
      <div class="code-label">Nội dung chuyển khoản (bắt buộc)</div>
      <div class="code-value" id="pcode">{payment_code}</div>
    </div>

    <div class="notice">
      ⚠️ Ghi đúng nội dung để hệ thống tự xác nhận.
    </div>

    <div class="status-bar">
      <div class="dot"></div>
      <span id="status-text">Đang chờ thanh toán...</span>
    </div>
  </div>

  <!-- Màn hình thành công -->
  <div class="success-screen" id="success">
    <div class="checkmark">✓</div>
    <div class="success-title">Thanh toán thành công!</div>
    <div class="success-amount" id="paid-amount"></div>
    <div class="success-code" id="paid-code"></div>
    <div class="success-time" id="paid-time"></div>
    <div class="tag">✅ Đã xác nhận</div>
  </div>

</div>

<script>
  const PAYMENT_CODE = "{payment_code}";
  const STATUS_URL   = "{status_url}";
  let pollCount = 0;

  async function checkStatus() {{
    pollCount++;
    document.getElementById("status-text").textContent =
      "Đang chờ thanh toán... (kiểm tra lần " + pollCount + ")";
    try {{
      const res = await fetch(STATUS_URL);
      const data = await res.json();
      if (data.is_paid) {{
        showSuccess(data);
        return;
      }}
    }} catch(e) {{}}
    setTimeout(checkStatus, 3000);
  }}

  function showSuccess(data) {{
    document.getElementById("waiting").style.display = "none";
    const s = document.getElementById("success");
    s.style.display = "flex";

    const txn = data.transaction || {{}};
    const amount = txn.transferAmount || {amount};
    document.getElementById("paid-amount").textContent =
      parseInt(amount).toLocaleString("vi-VN") + " VND";
    document.getElementById("paid-code").textContent =
      "Mã: " + PAYMENT_CODE;
    document.getElementById("paid-time").textContent =
      "Lúc " + (txn.transactionDate || data.paid_at || new Date().toLocaleString("vi-VN"));
  }}

  // Bắt đầu poll sau 3 giây
  setTimeout(checkStatus, 3000);
</script>
</body>
</html>""")


# ── Webhook từ SePay ──────────────────────────────────────────────────────────

@app.post("/api/payment/webhook", response_model=WebhookResponse)
async def sepay_webhook(
    request: Request,
    authorization: Optional[str] = Header(default=None),
):
    """
    SePay gọi endpoint này mỗi khi có giao dịch chuyển khoản vào tài khoản.
    Phải trả `{"success": true}` HTTP 200 để SePay đánh dấu thành công.
    """
    if not client.verify_webhook_header(authorization):
        _print_webhook_unauthorized()
        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Unauthorized"},
        )

    try:
        data: dict = await request.json()
    except Exception:
        return WebhookResponse(success=False, message="Payload không hợp lệ")

    txn = client.parse_webhook_payload(data)

    if not txn.is_incoming:
        _print_webhook_ignored(f"tiền ra (id={txn.transaction_id})")
        return WebhookResponse(success=True, message="Bỏ qua giao dịch tiền ra")

    payment_code = (txn.code or "").strip().upper()

    # Tìm trong store — khớp cả code lẫn content
    matched_code = None
    for code in list(payment_store.keys()):
        if (
            code.upper() == payment_code
            or code.upper() in txn.content.upper()
        ):
            matched_code = code
            break

    if matched_code:
        # Cập nhật trạng thái → paid
        payment_store[matched_code]["status"] = "paid"
        payment_store[matched_code]["paid_at"] = txn.transaction_date
        payment_store[matched_code]["transaction"] = txn.raw

        _print_paid_banner(
            payment_code=matched_code,
            amount=txn.transfer_amount,
            txn_date=txn.transaction_date,
            ref=txn.reference_code,
        )
    else:
        # Giao dịch vào nhưng không khớp đơn nào — vẫn log
        print(f"{YELLOW}[Webhook] Tiền vào không khớp đơn nào: "
              f"+{txn.transfer_amount:,} VND — code='{txn.code}' "
              f"content='{txn.content[:40]}'{RESET}")

    return WebhookResponse(
        success=True,
        message=f"+{txn.transfer_amount:,} VND — {txn.transaction_date}",
        payment_code=matched_code,
        is_matched=bool(matched_code),
    )


# ── Kiểm tra trạng thái ───────────────────────────────────────────────────────

@app.get("/api/payment/status/{payment_code}", response_model=PaymentStatusResponse)
async def check_payment_status(payment_code: str):
    """
    Kiểm tra trạng thái đơn hàng.
    Ưu tiên: in-memory store → SePay API.
    """
    # 1. Kiểm tra trong bộ nhớ trước (nhanh, không tốn API call)
    record = payment_store.get(payment_code.upper()) or payment_store.get(payment_code)
    if record and record["status"] == "paid":
        return PaymentStatusResponse(
            payment_code=payment_code,
            is_paid=True,
            transaction=record.get("transaction"),
            paid_at=record.get("paid_at"),
            message=f"Đã thanh toán {record['amount']:,} VND lúc {record.get('paid_at', '')}",
        )

    # 2. Hỏi SePay API (webhook chưa về vì đang local)
    # Lấy thời điểm tạo đơn để chỉ chấp nhận giao dịch SAU thời điểm đó
    created_after = (record or {}).get("created_at", "")
    # Cắt về format "YYYY-MM-DD HH:MM:SS" để so sánh với transaction_date
    if created_after and "T" in created_after:
        created_after = created_after[:19].replace("T", " ")

    try:
        txn = client.find_transaction_by_code(payment_code, created_after=created_after or None)
        if txn:
            paid_at = txn.get("transactionDate", "")
            amount  = int(float(txn.get("transferAmount", 0)))

            # Cập nhật store (tạo mới nếu chưa có)
            payment_store[payment_code] = {
                "status": "paid",
                "amount": amount,
                "created_at": payment_store.get(payment_code, {}).get("created_at", paid_at),
                "paid_at": paid_at,
                "transaction": txn,
            }

            # In banner chỉ 1 lần duy nhất
            if payment_code not in _notified:
                _notified.add(payment_code)
                _print_paid_banner(
                    payment_code=payment_code,
                    amount=amount,
                    txn_date=paid_at,
                    ref=txn.get("referenceCode", ""),
                )

            return PaymentStatusResponse(
                payment_code=payment_code,
                is_paid=True,
                transaction=txn,
                paid_at=paid_at,
                message=f"Đã thanh toán {amount:,} VND lúc {paid_at}",
            )
    except Exception as e:
        print(f"{YELLOW}[Status] Lỗi gọi SePay API: {e}{RESET}")

    return PaymentStatusResponse(
        payment_code=payment_code,
        is_paid=False,
        message="Chưa thanh toán",
    )


# ── Danh sách đơn đang chờ ────────────────────────────────────────────────────

@app.get("/api/payment/pending")
async def list_pending():
    """Xem tất cả đơn hàng đang chờ thanh toán (trong session hiện tại)."""
    pending = {
        code: rec
        for code, rec in payment_store.items()
        if rec["status"] == "pending"
    }
    return {
        "total": len(pending),
        "orders": [
            {
                "payment_code": code,
                "amount": rec["amount"],
                "created_at": rec["created_at"],
            }
            for code, rec in pending.items()
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=2007, reload=True)
