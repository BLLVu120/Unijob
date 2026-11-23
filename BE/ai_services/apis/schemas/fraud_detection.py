from pydantic import BaseModel, Field, field_validator
from typing import Optional


class FraudDetectionRequest(BaseModel):
    """Dữ liệu tin tuyển dụng cần kiểm tra lừa đảo."""

    # Nội dung bài đăng
    title: str = Field(..., min_length=1, description="Tiêu đề tin tuyển dụng")
    description: str = Field(..., min_length=1, description="Mô tả chi tiết công việc")

    # Thông tin lương (VND/tháng)
    salary_min: Optional[int] = Field(
        default=None, ge=0, description="Lương tối thiểu (VND/tháng)"
    )
    salary_max: Optional[int] = Field(
        default=None, ge=0, description="Lương tối đa (VND/tháng)"
    )

    # Thông tin liên hệ
    contact_email: Optional[str] = Field(
        default=None, description="Email liên hệ trong tin đăng"
    )
    contact_phone: Optional[str] = Field(
        default=None, description="Số điện thoại liên hệ"
    )

    # Thông tin công ty (từ hệ thống)
    company_tax_verified: bool = Field(
        default=False, description="Công ty đã xác minh mã số thuế"
    )
    company_email_verified: bool = Field(
        default=False, description="Công ty đã xác minh email"
    )
    company_score: Optional[int] = Field(
        default=None, ge=0, le=100, description="Điểm uy tín công ty (0–100)"
    )

    @field_validator("salary_max")
    @classmethod
    def validate_salary_range(cls, v: Optional[int], info) -> Optional[int]:
        salary_min = info.data.get("salary_min")
        if v is not None and salary_min is not None and v < salary_min:
            raise ValueError("salary_max phải lớn hơn hoặc bằng salary_min")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Tuyển CTV bán hàng online - Việc nhẹ lương cao!!!",
                "description": (
                    "Công ty cần tuyển cộng tác viên bán hàng online. "
                    "Thu nhập từ 20-50 triệu/tháng. Không cần kinh nghiệm. "
                    "Chỉ cần điện thoại. Liên hệ Zalo cá nhân để biết thêm chi tiết. "
                    "Cơ hội cuối cùng, đừng bỏ lỡ!"
                ),
                "salary_min": 20_000_000,
                "salary_max": 50_000_000,
                "contact_email": "tuyen.dung@gmail.com",
                "contact_phone": "0901234567",
                "company_tax_verified": False,
                "company_email_verified": False,
                "company_score": 15,
            }
        }


class KeywordFindingResponse(BaseModel):
    group_name: str = Field(description="Tên nhóm từ khóa")
    group_description: str = Field(description="Mô tả nhóm")
    matched_keywords: list[str] = Field(description="Từ khóa tìm thấy trong tin đăng")
    risk_contribution: int = Field(description="Điểm rủi ro đóng góp từ nhóm này")


class FraudBreakdownResponse(BaseModel):
    """Chi tiết điểm rủi ro từng nhóm tiêu chí."""

    keyword_findings: list[KeywordFindingResponse] = Field(
        description="Từ khóa nghi vấn tìm thấy"
    )
    keyword_risk: int = Field(description="Điểm rủi ro từ từ khóa (tối đa 60)")

    salary_risk: int = Field(description="Điểm rủi ro từ mức lương (tối đa 25)")
    salary_note: str = Field(description="Ghi chú về mức lương")

    text_quality_risk: int = Field(description="Điểm rủi ro từ chất lượng văn bản (tối đa 25)")
    text_quality_notes: list[str] = Field(description="Vấn đề về chất lượng văn bản")

    contact_risk: int = Field(description="Điểm rủi ro từ thông tin liên hệ (tối đa 30)")
    contact_notes: list[str] = Field(description="Vấn đề về thông tin liên hệ")

    company_trust_risk: int = Field(description="Điểm rủi ro từ độ tin cậy công ty (tối đa 35)")
    company_trust_notes: list[str] = Field(description="Vấn đề về độ tin cậy công ty")


class FraudDetectionResponse(BaseModel):
    """Kết quả nhận diện tin tuyển dụng lừa đảo."""

    risk_score: int = Field(description="Điểm rủi ro tổng (0–100)")
    risk_level: str = Field(
        description="Mức rủi ro: AN_TOÀN | CẦN_CHÚ_Ý | ĐÁNG_NGHI_NGỜ | NGUY_HIỂM_CAO"
    )
    risk_color: str = Field(description="Màu sắc mức rủi ro: green | yellow | orange | red")
    advice: str = Field(description="Lời khuyên dành cho ứng viên")
    is_suspicious: bool = Field(description="True nếu tin đăng đáng nghi ngờ (risk_score ≥ 46)")
    red_flags: list[str] = Field(description="Danh sách cảnh báo tóm tắt")
    breakdown: FraudBreakdownResponse = Field(description="Chi tiết phân tích từng tiêu chí")
