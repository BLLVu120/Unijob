import re
import os
import requests
from typing import Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"))

_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "form", "email_verification.html")


class CompanyVerifier:
    def __init__(self):
        self.mst_api_url = os.getenv("TAX_CODE_ENDPOINT")

    def verify_tax_code(self, tax_code: str) -> Dict[str, Any]:
        """
        Xác thực mã số thuế của doanh nghiệp.

        Returns:
            Dict với các trường: is_valid, tax_code, format_valid, company_info, error
        """
        result = {
            "is_valid": False,
            "tax_code": tax_code,
            "format_valid": False,
            "company_info": None,
            "error": None,
        }

        if not self._is_valid_tax_code_format(tax_code):
            result["error"] = "Mã số thuế không đúng định dạng (cần 10 hoặc 13 chữ số)"
            return result

        result["format_valid"] = True

        if not self.mst_api_url:
            # Không có API endpoint — chỉ xác thực format
            result["is_valid"] = True
            result["error"] = "Không có TAX_CODE_ENDPOINT, chỉ kiểm tra format"
            return result

        try:
            response = requests.get(f"{self.mst_api_url}{tax_code}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "00":
                    result["is_valid"] = True
                    result["company_info"] = data.get("data", {})
                else:
                    result["error"] = data.get("desc", "Không tìm thấy công ty với mã số thuế này")
            else:
                result["is_valid"] = True
                result["error"] = "API không khả dụng, chỉ kiểm tra format"
        except Exception as e:
            result["is_valid"] = True
            result["error"] = f"Lỗi khi gọi API: {str(e)}"

        return result

    def send_email_otp(self, email: str, otp: str) -> Dict[str, Any]:
        """
        Gửi email chứa mã OTP xác thực qua SendGrid.
        """
        api_key = os.getenv("SENDGRID_API_KEY")
        if not api_key:
            return {"success": False, "message": "SENDGRID_API_KEY chưa được cấu hình"}

        template_path = os.path.abspath(_TEMPLATE_PATH)
        try:
            with open(template_path, "r", encoding="utf-8") as f:
                html_content = f.read()
            html_content = html_content.replace("{{OTP}}", otp)
        except FileNotFoundError:
            # Fallback nếu không có template
            html_content = f"""
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
                <h2 style="color:#2563eb;">Xác thực tài khoản doanh nghiệp</h2>
                <p>Mã OTP của bạn là:</p>
                <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e40af;text-align:center;padding:16px 0;">{otp}</div>
                <p style="color:#6b7280;font-size:13px;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
            </div>
            """

        message = Mail(
            from_email=os.getenv("SENDGRID_FROM_EMAIL", "member@example.com"),
            to_emails=email,
            subject="Mã OTP xác thực tài khoản doanh nghiệp - Unijob",
            html_content=html_content,
        )

        try:
            sg = SendGridAPIClient(api_key)
            sg.send(message)
            return {"success": True, "message": "Gửi OTP thành công"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def _is_valid_tax_code_format(tax_code: str) -> bool:
        """Kiểm tra định dạng mã số thuế Việt Nam (10 hoặc 13 chữ số)."""
        if not tax_code:
            return False
        return bool(re.match(r"^\d{10}(\d{3})?$", tax_code.strip()))
