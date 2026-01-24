from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any
import sys
import os
from apis.schemas.company_verify import TaxCodeResponse, EmailOTPResponse, TaxCodeRequest, EmailOTPRequest
# Add parent directory to path to import CompanyVerifier
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from verification.company_verifier import CompanyVerifier

# Initialize FastAPI app
app = FastAPI(
    title="Company Verification API",
    description="API for verifying company tax codes and sending email OTP",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins, có thể config cụ thể hơn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CompanyVerifier
verifier = CompanyVerifier()

# API Endpoints
@app.post("/api/verify-tax-code", response_model=TaxCodeResponse)
async def verify_tax_code(request: TaxCodeRequest):
    """
    Xác thực mã số thuế
    
    - **tax_code**: Mã số thuế cần kiểm tra (10-13 chữ số)
    
    Returns:
    - **is_valid**: True nếu mã số thuế hợp lệ
    - **tax_code**: Mã số thuế đã kiểm tra
    - **format_valid**: True nếu định dạng đúng
    - **company_info**: Thông tin công ty (nếu có)
    - **error**: Thông báo lỗi (nếu có)
    """
    try:
        result = verifier.verify_tax_code(request.tax_code)
        print(result)
        return TaxCodeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xác thực mã số thuế: {str(e)}")

@app.post("/api/send-email-otp", response_model=EmailOTPResponse)
async def send_email_otp(request: EmailOTPRequest):
    """
    Gửi mã OTP qua email
    
    - **email**: Địa chỉ email để nhận mã OTP
    
    Returns:
    - **success**: True nếu gửi thành công
    - **message**: Thông báo kết quả
    """
    try:
        result = verifier.send_email_otp(request.email)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=result.get("message", "Không thể gửi email OTP")
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gửi email OTP: {str(e)}")

# Run with: uvicorn apis.host_company_verify:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=2004, reload=True)
