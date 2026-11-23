"""
SePay Webhook Client — Thanh toán chuyển khoản tự động cho Unijob.

Luồng hoạt động:
1. Tạo đơn hàng → sinh payment_code duy nhất
2. Trả về QR link dùng tài khoản MBBank của bạn + payment_code làm nội dung CK
3. Khách quét QR, chuyển khoản với nội dung chứa payment_code
4. SePay phát hiện giao dịch → gọi webhook đến /api/payment/webhook
5. Webhook xác minh header "Authorization: Apikey <SEPAY_WEBHOOK_SECRET>"
6. Khớp code → cập nhật trạng thái đơn hàng thành "paid"

Đọc từ .env:
    SEPAY_ACCESS_TOKEN   — Token gọi SePay REST API
    SEPAY_ACCOUNT_NUMBER — Số tài khoản ngân hàng (MBBank)
    SEPAY_ACCOUNT_NAME   — Tên chủ tài khoản
    SEPAY_WEBHOOK_SECRET — API Key xác minh webhook (Authorization: Apikey ...)
    SEPAY_BANK_CODE      — Mã ngân hàng (MBBank)
    SEPAY_API_URL        — Base URL SePay API (https://my.sepay.vn)
"""

import os
import time
import uuid
import requests
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlencode

from dotenv import load_dotenv

load_dotenv()

QR_BASE_URL = "https://qr.sepay.vn/img"
TRANSACTIONS_API_PATH = "/userapi/transactions/list"


# ── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class PaymentOrder:
    """Đơn thanh toán vừa được tạo."""
    payment_code: str          # Mã duy nhất — khách ghi vào nội dung CK
    order_amount: int          # Số tiền (VND)
    qr_image_url: str          # URL ảnh QR
    qr_embed_html: str         # <img> sẵn nhúng vào HTML
    account_number: str        # Số TK nhận tiền
    account_name: str          # Tên chủ TK
    bank_code: str             # Ngân hàng
    instruction: str           # Hướng dẫn cho khách


@dataclass
class WebhookTransaction:
    """Dữ liệu giao dịch nhận từ SePay webhook."""
    transaction_id: int
    gateway: str
    transaction_date: str
    account_number: str
    transfer_type: str          # "in" | "out"
    transfer_amount: int
    accumulated: int
    code: Optional[str]         # Payment code — SePay tự nhận diện
    content: str                # Nội dung chuyển khoản
    reference_code: str
    sub_account: Optional[str]
    description: str
    raw: dict = field(default_factory=dict)

    @property
    def is_incoming(self) -> bool:
        return self.transfer_type == "in"


# ── Client ───────────────────────────────────────────────────────────────────

class SePayWebhookClient:
    """
    Client tích hợp SePay theo mô hình Webhook.
    Không dùng Payment Gateway — chỉ cần tài khoản ngân hàng + SePay monitor.
    """

    def __init__(self):
        self.access_token = os.getenv("SEPAY_ACCESS_TOKEN", "")
        self.account_number = os.getenv("SEPAY_ACCOUNT_NUMBER", "")
        self.account_name = os.getenv("SEPAY_ACCOUNT_NAME", "")
        self.webhook_secret = os.getenv("SEPAY_WEBHOOK_SECRET", "")
        self.bank_code = os.getenv("SEPAY_BANK_CODE", "MBBank")
        self.api_url = os.getenv("SEPAY_API_URL", "https://my.sepay.vn").rstrip("/")

    # ── Tạo đơn thanh toán ────────────────────────────────────────────────────

    def create_payment_order(
        self,
        amount: int,
        order_id: Optional[str] = None,
        extra_description: Optional[str] = None,
    ) -> PaymentOrder:
        """
        Tạo đơn thanh toán: sinh mã duy nhất + link QR.

        Args:
            amount: Số tiền (VND, tối thiểu 1,000)
            order_id: ID đơn hàng trên hệ thống (tùy chọn)
            extra_description: Mô tả thêm (tùy chọn, không đưa vào nội dung CK)

        Returns:
            PaymentOrder chứa payment_code, QR URL và hướng dẫn
        """
        payment_code = self._generate_payment_code(order_id)
        qr_url = self._build_qr_url(amount, payment_code)
        embed_html = (
            f'<img src="{qr_url}" '
            f'alt="QR thanh toán {self.bank_code} {payment_code}" />'
        )
        instruction = (
            f"Chuyển khoản {amount:,} VND đến tài khoản {self.account_number} "
            f"({self.bank_code}) — {self.account_name}. "
            f"Nội dung chuyển khoản: {payment_code}"
        )

        return PaymentOrder(
            payment_code=payment_code,
            order_amount=amount,
            qr_image_url=qr_url,
            qr_embed_html=embed_html,
            account_number=self.account_number,
            account_name=self.account_name,
            bank_code=self.bank_code,
            instruction=instruction,
        )

    # ── Xác minh webhook ─────────────────────────────────────────────────────

    def verify_webhook_header(self, authorization: Optional[str]) -> bool:
        """
        Kiểm tra header Authorization từ SePay.
        SePay gửi: "Authorization: Apikey <SEPAY_WEBHOOK_SECRET>"

        Args:
            authorization: Giá trị header Authorization

        Returns:
            True nếu hợp lệ
        """
        if not authorization or not self.webhook_secret:
            return False
        expected = f"Apikey {self.webhook_secret}"
        return authorization.strip() == expected

    def parse_webhook_payload(self, data: dict) -> WebhookTransaction:
        """
        Parse JSON payload từ SePay webhook.

        Args:
            data: dict từ request.json()

        Returns:
            WebhookTransaction
        """
        return WebhookTransaction(
            transaction_id=data.get("id", 0),
            gateway=data.get("gateway", ""),
            transaction_date=data.get("transactionDate", ""),
            account_number=data.get("accountNumber", ""),
            transfer_type=data.get("transferType", ""),
            transfer_amount=int(data.get("transferAmount", 0)),
            accumulated=int(data.get("accumulated", 0)),
            code=data.get("code"),
            content=data.get("content", ""),
            reference_code=data.get("referenceCode", ""),
            sub_account=data.get("subAccount"),
            description=data.get("description", ""),
            raw=data,
        )

    def is_payment_matched(
        self,
        transaction: WebhookTransaction,
        payment_code: str,
        expected_amount: Optional[int] = None,
    ) -> bool:
        """
        Kiểm tra giao dịch có khớp với đơn hàng không.

        Khớp khi:
        - Giao dịch là tiền vào (transferType = "in")
        - code đúng HOẶC content chứa payment_code
        - Số tiền đúng (nếu expected_amount được truyền vào)

        Args:
            transaction: Giao dịch từ webhook
            payment_code: Mã đơn hàng cần đối soát
            expected_amount: Số tiền kỳ vọng (None = không kiểm tra)

        Returns:
            True nếu khớp
        """
        if not transaction.is_incoming:
            return False

        code_matched = (
            (transaction.code and transaction.code.upper() == payment_code.upper())
            or payment_code.upper() in transaction.content.upper()
        )

        if not code_matched:
            return False

        if expected_amount is not None:
            return transaction.transfer_amount >= expected_amount

        return True

    # ── Truy vấn lịch sử giao dịch qua API ───────────────────────────────────

    def get_transactions(
        self,
        limit: int = 20,
        page: int = 1,
    ) -> list[dict]:
        """
        Lấy danh sách giao dịch gần nhất qua SePay REST API.

        Args:
            limit: Số giao dịch mỗi trang (tối đa 100)
            page: Trang hiện tại

        Returns:
            Danh sách giao dịch hoặc [] nếu lỗi
        """
        if not self.access_token:
            raise ValueError("SEPAY_ACCESS_TOKEN chưa được cấu hình trong .env")

        url = f"{self.api_url}{TRANSACTIONS_API_PATH}"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        params = {
            "limit": limit,
            "page": page,
            "account_number": self.account_number,
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get("transactions", [])
        except requests.RequestException as e:
            raise RuntimeError(f"Lỗi gọi SePay API: {str(e)}")

    def find_transaction_by_code(
        self,
        payment_code: str,
        created_after: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Tìm giao dịch đã nhận theo payment_code qua SePay REST API.

        Chỉ chấp nhận giao dịch xảy ra SAU thời điểm tạo đơn (created_after)
        để tránh khớp nhầm với giao dịch cũ trong lịch sử.

        Lưu ý: field names REST API khác webhook:
          REST API            | Webhook
          --------------------|------------------
          transaction_content | content
          amount_in           | transferAmount
          transaction_date    | transactionDate
          reference_number    | referenceCode

        Args:
            payment_code: Mã đơn hàng cần tìm
            created_after: ISO string thời điểm tạo đơn (VD: "2026-03-02 17:50:00")
                           Bỏ qua giao dịch xảy ra trước thời điểm này.

        Returns:
            Dict giao dịch (đã chuẩn hoá) hoặc None nếu chưa thanh toán
        """
        transactions = self.get_transactions(limit=50)
        for txn in transactions:
            code    = (txn.get("code") or "").strip()
            content = (txn.get("transaction_content") or txn.get("content") or "").strip()
            amount_in  = float(txn.get("amount_in") or 0)
            is_incoming = amount_in > 0 or txn.get("transferType") == "in"
            txn_date = (txn.get("transaction_date") or txn.get("transactionDate") or "").strip()

            if not is_incoming:
                continue

            # Bỏ qua giao dịch xảy ra trước khi đơn được tạo
            if created_after and txn_date and txn_date <= created_after:
                continue

            if (
                code.upper() == payment_code.upper()
                or payment_code.upper() in content.upper()
            ):
                return {
                    **txn,
                    "transferAmount": amount_in,
                    "transactionDate": txn_date,
                    "content": content,
                    "referenceCode": txn.get("reference_number") or txn.get("referenceCode", ""),
                }
        return None

    # ── Tiện ích ─────────────────────────────────────────────────────────────

    def _build_qr_url(self, amount: int, payment_code: str) -> str:
        """Tạo URL ảnh QR SePay với thông tin tài khoản và mã đơn hàng."""
        params = {
            "acc": self.account_number,
            "bank": self.bank_code,
            "amount": str(amount),
            "des": payment_code,
        }
        return f"{QR_BASE_URL}?{urlencode(params)}"

    @staticmethod
    def _generate_payment_code(order_id: Optional[str] = None) -> str:
        """
        Sinh mã thanh toán duy nhất mỗi lần — luôn có timestamp + random suffix
        để tránh trùng với giao dịch cũ trong lịch sử SePay.

        Format: DH<6 số timestamp><4 ký tự random>
        Ví dụ: DH7391524AB3F
        Nếu có order_id: DH<order prefix><timestamp>
        """
        ts = str(int(time.time()))[-6:]
        uid = uuid.uuid4().hex[:4].upper()
        if order_id:
            prefix = "".join(c for c in order_id.upper() if c.isalnum())[:4]
            return f"DH{prefix}{ts}{uid}"
        return f"DH{ts}{uid}"
