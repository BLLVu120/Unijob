import re
import requests
from typing import Tuple, Dict, Any
import time
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import os

load_dotenv()

class CompanyVerifier:
    def __init__(self):
        """
        Initialize CompanyVerifier
        
        Args:
            google_maps_api_key: API key of Google Maps (optional)
        """
        self.mst_api_url = "https://api.vietqr.io/v2/business/"
    
    
    def verify_tax_code(self, tax_code: str) -> Dict[str, Any]:
        """
        Verify tax code detailed
        
        Args:
            tax_code: Tax code to verify
            
        Returns:
            Dictionary containing detailed information about tax code
        """
        result = {
            "is_valid": False,
            "tax_code": tax_code,
            "format_valid": False,
            "company_info": None,
            "error": None
        }
        
        # Verify format
        if not self._is_valid_tax_code_format(tax_code):
            result["error"] = "Mã số thuế không đúng định dạng"
            return result
        
        result["format_valid"] = True
        
        # Gọi API để lấy thông tin công ty
        try:
            response = requests.get(
                f"{self.mst_api_url}{tax_code}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "00":
                    result["is_valid"] = True
                    result["company_info"] = data.get("data", {})
                else:
                    result["error"] = data.get("desc", "Không tìm thấy công ty")
            else:
                # Nếu API không khả dụng, chấp nhận nếu format đúng
                result["is_valid"] = True
                result["error"] = "API không khả dụng, chỉ kiểm tra format"
        except Exception as e:
            result["is_valid"] = True  # Chấp nhận nếu format đúng
            result["error"] = f"Lỗi khi gọi API: {str(e)}"
        
        return result
    
    def _is_valid_tax_code_format(self, tax_code: str) -> bool:
        """
        Verify tax code format
        Vietnam tax code: 10 digits (individual/company) or 10-13 digits (with branch)
        
        Args:
            tax_code: Tax code to verify
            
        Returns:
            True if format is correct, False if not
        """
        if not tax_code:
            return False
        
        # Vietnam tax code: 10-13 digits
        pattern = r'^\d{10}(\d{3})?$'
        return bool(re.match(pattern, tax_code.strip()))

    def send_email_otp(self, email: str) -> Dict[str, Any]:
        """
        Send email OTP
        """
        api_key = os.getenv('SENDGRID_API_KEY')

        with open("./form/email_verification.html", "r", encoding="utf-8") as f:
            html_content = f.read()

        message = Mail(
            from_email='member@example.com',
            to_emails=email,
            subject='Test Email OTP',
            html_content=html_content)

        try:
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
            return {
                "success": True,
                "message": "Email OTP sent successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }