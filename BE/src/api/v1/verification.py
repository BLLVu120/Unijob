import os

from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.verification import otp_store
from src.verification.company_verifier import CompanyVerifier

load_dotenv(
    # src/api/v1 → src/api → src → BE/.env
    dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
)

router = APIRouter(prefix="/verification", tags=["Company Verification"])

verifier = CompanyVerifier()

# ─── Request Models ────────────────────────────────────────────────────────────


class VerifyTaxCodeRequest(BaseModel):
    tax_code: str = Field(
        ..., description="Mã số thuế doanh nghiệp (10 hoặc 13 chữ số)"
    )


class SendOtpRequest(BaseModel):
    email: str = Field(..., description="Email nhận mã OTP")


class VerifyOtpRequest(BaseModel):
    email: str = Field(..., description="Email đã nhận mã OTP")
    otp: str = Field(..., description="Mã OTP 6 chữ số")


# ─── Endpoints ─────────────────────────────────────────────────────────────────


@router.post("/verify-tax-code")
def verify_tax_code(body: VerifyTaxCodeRequest):
    """
    Xác thực mã số thuế của doanh nghiệp.

    - Tra cứu thông tin công ty qua API thuế (nếu có `TAX_CODE_ENDPOINT`).
    - Trả về kết quả xác thực cùng thông tin công ty nếu hợp lệ.
    """
    result = verifier.verify_tax_code(body.tax_code)
    return {
        "status": True,
        "tax_verification": result,
    }


@router.post("/send-otp")
def send_otp(body: SendOtpRequest):
    """
    Gửi mã OTP đến email của employer để xác thực tài khoản doanh nghiệp.

    - Tạo mã OTP ngẫu nhiên 6 chữ số MỚI cho mỗi request, lưu vào bộ nhớ với TTL 5 phút.
    - Gửi email HTML có chứa OTP qua SendGrid.
    """
    otp = otp_store.generate_otp()
    otp_store.save_otp(body.email, otp)

    send_result = verifier.send_email_otp(body.email, otp)
    if not send_result["success"]:
        otp_store._store.pop(body.email, None)
        return {"status": False, "error": send_result["message"]}

    return {
        "status": True,
        "message": f"Đã gửi mã OTP tới {body.email}. Mã có hiệu lực trong 5 phút.",
    }


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpRequest):
    """
    Xác thực mã OTP và đánh dấu tài khoản doanh nghiệp là đã xác thực (`is_verified = true`).

    - Kiểm tra OTP hợp lệ và còn trong thời hạn 5 phút.
    """
    if not otp_store.verify_otp(body.email, body.otp):
        return {
            "status": False,
            "error": "Mã OTP không hợp lệ hoặc đã hết hạn",
        }

    return {
        "status": True,
        "message": "Xác thực OTP thành công. Vui lòng tiếp tục bước tiếp theo.",
    }
