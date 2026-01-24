from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any

# Response models
class TaxCodeResponse(BaseModel):
    is_valid: bool
    tax_code: str
    format_valid: bool
    company_info: Dict[str, Any] | None
    error: str | None

class EmailOTPResponse(BaseModel):
    success: bool
    message: str

# Request models
class TaxCodeRequest(BaseModel):
    tax_code: str = Field(..., description="Mã số thuế cần xác thực (10-13 chữ số)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "tax_code": "0123456789"
            }
        }

class EmailOTPRequest(BaseModel):
    email: EmailStr = Field(..., description="Email để gửi mã OTP")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }