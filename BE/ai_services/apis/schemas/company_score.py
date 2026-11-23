from pydantic import BaseModel, Field, field_validator
from typing import Optional


class CompanyScoreRequest(BaseModel):
    """Dữ liệu đầu vào để chấm điểm công ty."""

    # Xác minh danh tính
    tax_code_verified: bool = Field(
        default=False,
        description="Mã số thuế đã được xác minh hay chưa",
    )
    email_verified: bool = Field(
        default=False,
        description="Email doanh nghiệp đã được xác minh hay chưa",
    )

    # Hồ sơ công ty
    company_name: Optional[str] = Field(
        default=None,
        description="Tên công ty",
    )
    description: Optional[str] = Field(
        default=None,
        description="Mô tả công ty",
    )
    address: Optional[str] = Field(
        default=None,
        description="Địa chỉ công ty",
    )
    website: Optional[str] = Field(
        default=None,
        description="Website chính thức",
    )
    logo_url: Optional[str] = Field(
        default=None,
        description="URL logo công ty",
    )

    # Hoạt động đăng tuyển
    total_jobs_posted: int = Field(
        default=0,
        ge=0,
        description="Tổng số tin tuyển dụng đã đăng",
    )
    recent_jobs_posted: int = Field(
        default=0,
        ge=0,
        description="Số tin tuyển dụng đăng trong 30 ngày gần đây",
    )

    # Tỷ lệ phản hồi (0.0 - 1.0)
    response_rate: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Tỷ lệ phản hồi ứng viên (0.0 đến 1.0)",
    )

    # Đánh giá từ sinh viên
    average_rating: Optional[float] = Field(
        default=None,
        description="Điểm đánh giá trung bình từ sinh viên (1.0 đến 5.0)",
    )
    total_reviews: int = Field(
        default=0,
        ge=0,
        description="Tổng số đánh giá từ sinh viên",
    )

    @field_validator("average_rating")
    @classmethod
    def validate_rating(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (1.0 <= v <= 5.0):
            raise ValueError("average_rating phải nằm trong khoảng 1.0 đến 5.0")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "tax_code_verified": True,
                "email_verified": True,
                "company_name": "Công ty TNHH ABC",
                "description": "Chúng tôi là công ty chuyên cung cấp dịch vụ công nghệ thông tin tại Việt Nam với hơn 10 năm kinh nghiệm.",
                "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
                "website": "https://abc.com.vn",
                "logo_url": "https://cdn.abc.com.vn/logo.png",
                "total_jobs_posted": 8,
                "recent_jobs_posted": 3,
                "response_rate": 0.85,
                "average_rating": 4.2,
                "total_reviews": 15,
            }
        }


class ScoreBreakdownResponse(BaseModel):
    """Chi tiết điểm từng tiêu chí."""

    # Xác minh danh tính
    tax_code_score: int = Field(description="Điểm xác minh mã số thuế (tối đa 20)")
    email_score: int = Field(description="Điểm xác minh email (tối đa 10)")
    verification_total: int = Field(description="Tổng điểm xác minh (tối đa 30)")

    # Hồ sơ công ty
    profile_name_score: int = Field(description="Điểm tên công ty (tối đa 5)")
    profile_description_score: int = Field(description="Điểm mô tả công ty (tối đa 5)")
    profile_address_score: int = Field(description="Điểm địa chỉ (tối đa 5)")
    profile_website_score: int = Field(description="Điểm website (tối đa 5)")
    profile_logo_score: int = Field(description="Điểm logo (tối đa 5)")
    profile_total: int = Field(description="Tổng điểm hồ sơ (tối đa 25)")

    # Hoạt động đăng tuyển
    jobs_total_score: int = Field(description="Điểm tổng job đã đăng (tối đa 10)")
    jobs_recent_score: int = Field(description="Điểm job đăng gần đây (tối đa 10)")
    activity_total: int = Field(description="Tổng điểm hoạt động (tối đa 20)")

    # Tỷ lệ phản hồi
    response_rate_score: int = Field(description="Điểm tỷ lệ phản hồi (tối đa 15)")

    # Đánh giá sinh viên
    review_score: int = Field(description="Điểm đánh giá từ sinh viên (tối đa 10)")


class CompanyScoreResponse(BaseModel):
    """Kết quả chấm điểm công ty."""

    total_score: int = Field(description="Tổng điểm uy tín")
    max_score: int = Field(description="Điểm tối đa có thể đạt (100)")
    percentage: float = Field(description="Phần trăm điểm đạt được")
    grade: str = Field(description="Xếp loại: A, B, C, D hoặc F")
    grade_label: str = Field(description="Mô tả xếp loại")
    breakdown: ScoreBreakdownResponse = Field(description="Chi tiết điểm từng tiêu chí")
    suggestions: list[str] = Field(description="Gợi ý cải thiện điểm số")
