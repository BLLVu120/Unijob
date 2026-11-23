import sys
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fraud_detection import FraudDetector
from fraud_detection.fraud_detector import JobPostingData
from fraud_detection.detection_rules import RISK_LEVELS, SalaryThresholds
from fraud_detection.keywords import ALL_KEYWORD_GROUPS
from apis.schemas.fraud_detection import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    FraudBreakdownResponse,
    KeywordFindingResponse,
)

app = FastAPI(
    title="Fraud Detection API",
    description="API nhận diện tin tuyển dụng lừa đảo trên nền tảng Unijob",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = FraudDetector()


@app.post("/api/detect-fraud", response_model=FraudDetectionResponse)
async def detect_fraud(request: FraudDetectionRequest):
    """
    Phân tích tin tuyển dụng và trả về điểm rủi ro lừa đảo.

    **Mức rủi ro:**
    | Điểm  | Mức          | Ý nghĩa                                      |
    |-------|--------------|----------------------------------------------|
    | 0–20  | AN_TOÀN      | Tin đăng có vẻ đáng tin cậy                 |
    | 21–45 | CẦN_CHÚ_Ý   | Có một số dấu hiệu cần xem xét thêm         |
    | 46–70 | ĐÁNG_NGHI_NGỜ| Nhiều dấu hiệu bất thường, cần thận trọng   |
    | 71–100| NGUY_HIỂM_CAO| Nguy cơ lừa đảo rất cao, không nên ứng tuyển|

    **5 tiêu chí phân tích:**
    1. Từ khóa nghi vấn trong tiêu đề & mô tả (tối đa 60 điểm)
    2. Mức lương bất thường so với thực tế (tối đa 25 điểm)
    3. Chất lượng văn bản: spam-like, quá ngắn (tối đa 25 điểm)
    4. Thông tin liên hệ: email cá nhân, thiếu thông tin (tối đa 30 điểm)
    5. Độ tin cậy công ty: chưa xác minh, điểm thấp (tối đa 35 điểm)
    """
    try:
        job = JobPostingData(
            title=request.title,
            description=request.description,
            salary_min=request.salary_min,
            salary_max=request.salary_max,
            contact_email=request.contact_email,
            contact_phone=request.contact_phone,
            company_tax_verified=request.company_tax_verified,
            company_email_verified=request.company_email_verified,
            company_score=request.company_score,
        )

        result = detector.analyze(job)

        keyword_responses = [
            KeywordFindingResponse(
                group_name=f.group_name,
                group_description=f.group_description,
                matched_keywords=f.matched_keywords,
                risk_contribution=f.risk_contribution,
            )
            for f in result.breakdown.keyword_findings
        ]

        breakdown_response = FraudBreakdownResponse(
            keyword_findings=keyword_responses,
            keyword_risk=result.breakdown.keyword_risk,
            salary_risk=result.breakdown.salary_risk,
            salary_note=result.breakdown.salary_note,
            text_quality_risk=result.breakdown.text_quality_risk,
            text_quality_notes=result.breakdown.text_quality_notes,
            contact_risk=result.breakdown.contact_risk,
            contact_notes=result.breakdown.contact_notes,
            company_trust_risk=result.breakdown.company_trust_risk,
            company_trust_notes=result.breakdown.company_trust_notes,
        )

        return FraudDetectionResponse(
            risk_score=result.risk_score,
            risk_level=result.risk_level,
            risk_color=result.risk_color,
            advice=result.advice,
            is_suspicious=result.is_suspicious,
            red_flags=result.red_flags,
            breakdown=breakdown_response,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi phân tích tin tuyển dụng: {str(e)}")


@app.get("/api/detect-fraud/rules")
async def get_detection_rules():
    """
    Trả về cấu hình các quy tắc phát hiện lừa đảo đang áp dụng:
    danh sách nhóm từ khóa, ngưỡng lương và mức rủi ro.
    """
    salary = SalaryThresholds()
    return {
        "keyword_groups": [
            {
                "name": g.name,
                "description": g.description,
                "risk_weight": g.risk_weight,
                "keyword_count": len(g.keywords),
            }
            for g in ALL_KEYWORD_GROUPS
        ],
        "salary_thresholds": {
            "part_time_warning_vnd": salary.PART_TIME_WARNING,
            "part_time_suspicious_vnd": salary.PART_TIME_SUSPICIOUS,
            "warning_risk_points": salary.SALARY_WARNING_RISK,
            "suspicious_risk_points": salary.SALARY_SUSPICIOUS_RISK,
        },
        "risk_levels": [
            {
                "label": lvl.label,
                "min_score": lvl.min_score,
                "max_score": lvl.max_score,
                "color": lvl.color,
                "advice": lvl.advice,
            }
            for lvl in RISK_LEVELS
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=2006, reload=True)
