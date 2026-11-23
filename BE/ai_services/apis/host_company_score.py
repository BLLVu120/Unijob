import sys
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from company_score import CompanyScorer
from company_score.company_scorer import CompanyData
from company_score.score_weights import ScoreWeights, GRADE_THRESHOLDS
from apis.schemas.company_score import (
    CompanyScoreRequest,
    CompanyScoreResponse,
    ScoreBreakdownResponse,
)

app = FastAPI(
    title="Company Score API",
    description="API chấm điểm uy tín công ty trên nền tảng Unijob",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = CompanyScorer()


@app.post("/api/company-score", response_model=CompanyScoreResponse)
async def calculate_company_score(request: CompanyScoreRequest):
    """
    Chấm điểm uy tín công ty dựa trên các tiêu chí:

    | Tiêu chí                | Điểm tối đa |
    |-------------------------|-------------|
    | Xác minh mã số thuế     | 20          |
    | Xác minh email          | 10          |
    | Hồ sơ công ty           | 25          |
    | Hoạt động đăng tuyển    | 20          |
    | Tỷ lệ phản hồi ứng viên | 15          |
    | Đánh giá từ sinh viên   | 10          |
    | **Tổng**                | **100**     |

    **Xếp loại:**
    - **A** (80–100): Xuất sắc
    - **B** (60–79): Tốt
    - **C** (40–59): Trung bình
    - **D** (20–39): Yếu
    - **F** (0–19): Chưa đạt
    """
    try:
        company = CompanyData(
            tax_code_verified=request.tax_code_verified,
            email_verified=request.email_verified,
            company_name=request.company_name,
            description=request.description,
            address=request.address,
            website=request.website,
            logo_url=request.logo_url,
            total_jobs_posted=request.total_jobs_posted,
            recent_jobs_posted=request.recent_jobs_posted,
            response_rate=request.response_rate,
            average_rating=request.average_rating,
            total_reviews=request.total_reviews,
        )

        result = scorer.calculate_score(company)

        breakdown = ScoreBreakdownResponse(
            tax_code_score=result.breakdown.tax_code_score,
            email_score=result.breakdown.email_score,
            verification_total=result.breakdown.verification_total,
            profile_name_score=result.breakdown.profile_name_score,
            profile_description_score=result.breakdown.profile_description_score,
            profile_address_score=result.breakdown.profile_address_score,
            profile_website_score=result.breakdown.profile_website_score,
            profile_logo_score=result.breakdown.profile_logo_score,
            profile_total=result.breakdown.profile_total,
            jobs_total_score=result.breakdown.jobs_total_score,
            jobs_recent_score=result.breakdown.jobs_recent_score,
            activity_total=result.breakdown.activity_total,
            response_rate_score=result.breakdown.response_rate_score,
            review_score=result.breakdown.review_score,
        )

        return CompanyScoreResponse(
            total_score=result.total_score,
            max_score=result.max_score,
            percentage=result.percentage,
            grade=result.grade,
            grade_label=result.grade_label,
            breakdown=breakdown,
            suggestions=result.suggestions,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi chấm điểm công ty: {str(e)}")


@app.get("/api/company-score/weights")
async def get_score_weights():
    """
    Trả về cấu hình trọng số điểm và ngưỡng xếp loại hiện tại.
    """
    w = ScoreWeights()
    return {
        "weights": {
            "verification": {
                "tax_code_verified": w.TAX_CODE_VERIFIED,
                "email_verified": w.EMAIL_VERIFIED,
                "total_max": w.TAX_CODE_VERIFIED + w.EMAIL_VERIFIED,
            },
            "profile": {
                "company_name": w.PROFILE_NAME,
                "description": w.PROFILE_DESCRIPTION,
                "address": w.PROFILE_ADDRESS,
                "website": w.PROFILE_WEBSITE,
                "logo": w.PROFILE_LOGO,
                "total_max": (
                    w.PROFILE_NAME + w.PROFILE_DESCRIPTION + w.PROFILE_ADDRESS
                    + w.PROFILE_WEBSITE + w.PROFILE_LOGO
                ),
            },
            "activity": {
                "jobs_total_max": w.JOBS_TOTAL_MAX,
                "jobs_total_cap": w.JOBS_TOTAL_CAP,
                "jobs_recent_max": w.JOBS_RECENT_MAX,
                "jobs_recent_cap": w.JOBS_RECENT_CAP,
                "total_max": w.JOBS_TOTAL_MAX + w.JOBS_RECENT_MAX,
            },
            "response_rate": {
                "max": w.RESPONSE_RATE_MAX,
            },
            "review": {
                "max": w.REVIEW_MAX,
            },
            "total_max": w.total_max,
        },
        "grade_thresholds": {
            grade: {"min": low, "max": high}
            for grade, (low, high) in GRADE_THRESHOLDS.items()
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=2005, reload=True)
