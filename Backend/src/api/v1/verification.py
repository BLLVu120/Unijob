from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field
from src.db.connection import DB
# from src.db.emp import set_employer_verified, get_employer_by_id
from src.verification.company_verifier import CompanyVerifier
from src.verification import otp_store
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"))

router = APIRouter(prefix="/verification", tags=["Company Verification"])

verifier = CompanyVerifier()

# ─── Request Models ────────────────────────────────────────────────────────────

class VerifyTaxCodeRequest(BaseModel):
    tax_code: str = Field(..., description="Mã số thuế doanh nghiệp (10 hoặc 13 chữ số)")


class SendOtpRequest(BaseModel):
    email: str = Field(..., description="Email nhận mã OTP")


class VerifyOtpRequest(BaseModel):
    email: str = Field(..., description="Email đã nhận mã OTP")
    otp: str = Field(..., description="Mã OTP 6 chữ số")

OTP = otp_store.generate_otp()

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

    - Tạo mã OTP ngẫu nhiên 6 chữ số, lưu vào bộ nhớ với TTL 5 phút.
    - Gửi email HTML có chứa OTP qua SendGrid.
    """
    # db = DB()
    # connection = db.connect()
    # if not connection.get("status"):
    #     return {"status": False, "error": "Không thể kết nối cơ sở dữ liệu"}

    # engine = connection["engine"]

    # emp_result = get_employer_by_id(engine, body.emp_id)
    # if not emp_result.get("status") or not emp_result.get("employer"):
    #     return {"status": False, "error": "Không tìm thấy employer"}

    # otp = otp_store.generate_otp()
    
    otp_store.save_otp(body.email, OTP)

    send_result = verifier.send_email_otp(body.email, OTP)
    if not send_result["success"]:
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
    - Nếu đúng, cập nhật `is_verified = true` trong bảng `employers`.
    """
    if not otp_store.verify_otp(body.email, body.otp):
        return {
            "status": False,
            "error": "Mã OTP không hợp lệ hoặc đã hết hạn",
        }

    if body.otp == OTP:
        return {
            "status": True,
            "message": "Xác thực tài khoản doanh nghiệp thành công. Tài khoản đã được kích hoạt.",
        }
    else:
        return {
            "status": False,
            "error": "Mã OTP không hợp lệ hoặc đã hết hạn",
        }

    return {
        "status": True,
        "message": "Xác thực tài khoản doanh nghiệp thành công. Tài khoản đã được kích hoạt.",
    }
