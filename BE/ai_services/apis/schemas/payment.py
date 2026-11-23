from pydantic import BaseModel, Field
from typing import Optional


# ── Tạo đơn thanh toán ───────────────────────────────────────────────────────

class CreatePaymentRequest(BaseModel):
    amount: int = Field(..., ge=1000, description="Số tiền (VND, tối thiểu 1,000)")
    order_id: Optional[str] = Field(
        default=None,
        description="ID đơn hàng trên hệ thống (tùy chọn, dùng để sinh payment_code)",
    )
    extra_description: Optional[str] = Field(
        default=None,
        description="Mô tả thêm về đơn hàng (chỉ lưu nội bộ, không đưa vào nội dung CK)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 150000,
                "order_id": "ORDER-001",
                "extra_description": "Phí đăng ký Unijob Premium tháng 1/2026",
            }
        }


class CreatePaymentResponse(BaseModel):
    payment_code: str = Field(
        description="Mã đơn hàng — khách PHẢI ghi vào nội dung chuyển khoản"
    )
    order_amount: int = Field(description="Số tiền cần chuyển (VND)")
    qr_image_url: str = Field(description="URL ảnh QR — dùng trong <img src>")
    qr_embed_html: str = Field(description="HTML <img /> sẵn nhúng vào trang")
    account_number: str = Field(description="Số tài khoản nhận tiền")
    account_name: str = Field(description="Tên chủ tài khoản")
    bank_code: str = Field(description="Ngân hàng")
    instruction: str = Field(description="Hướng dẫn chuyển khoản cho khách")


# ── Webhook từ SePay ─────────────────────────────────────────────────────────

class SePayWebhookPayload(BaseModel):
    """Payload JSON SePay gửi về khi có giao dịch."""

    id: int = Field(description="ID giao dịch trên SePay")
    gateway: str = Field(description="Tên ngân hàng")
    transactionDate: str = Field(description="Thời gian giao dịch")
    accountNumber: str = Field(description="Số tài khoản ngân hàng")
    transferType: str = Field(description="'in' = tiền vào, 'out' = tiền ra")
    transferAmount: int = Field(description="Số tiền giao dịch")
    accumulated: int = Field(description="Số dư tài khoản")
    referenceCode: str = Field(description="Mã tham chiếu từ ngân hàng")
    content: str = Field(description="Nội dung chuyển khoản")
    description: str = Field(description="Nội dung SMS đầy đủ")
    code: Optional[str] = Field(default=None, description="Payment code (SePay tự nhận diện)")
    subAccount: Optional[str] = Field(default=None, description="Tài khoản ảo (VA)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 92704,
                "gateway": "MBBank",
                "transactionDate": "2026-01-15 10:30:00",
                "accountNumber": "0123456789",
                "transferType": "in",
                "transferAmount": 150000,
                "accumulated": 5000000,
                "referenceCode": "MB.1234567890",
                "content": "DH123456AB thanh toan don hang",
                "description": "So du tai khoan MB...",
                "code": "DH123456AB",
                "subAccount": None,
            }
        }


class WebhookResponse(BaseModel):
    """Response trả về SePay — BẮT BUỘC có success: true để SePay đánh dấu thành công."""
    success: bool
    message: str
    payment_code: Optional[str] = None
    is_matched: bool = False


# ── Kiểm tra trạng thái ──────────────────────────────────────────────────────

class PaymentStatusResponse(BaseModel):
    payment_code: str
    is_paid: bool
    transaction: Optional[dict] = Field(
        default=None,
        description="Thông tin giao dịch từ SePay API (nếu đã thanh toán)",
    )
    paid_at: Optional[str] = Field(default=None, description="Thời gian thanh toán")
    message: str
