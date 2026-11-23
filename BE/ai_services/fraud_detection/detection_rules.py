"""
Quy tắc phát hiện tin tuyển dụng lừa đảo và cấu hình mức rủi ro.
"""

from dataclasses import dataclass


# ── Mức rủi ro ────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class RiskLevel:
    label: str
    min_score: int
    max_score: int
    color: str
    advice: str


RISK_LEVELS: tuple[RiskLevel, ...] = (
    RiskLevel(
        label="AN_TOÀN",
        min_score=0,
        max_score=20,
        color="green",
        advice="Tin tuyển dụng có vẻ đáng tin cậy. Vẫn nên đọc kỹ trước khi ứng tuyển.",
    ),
    RiskLevel(
        label="CẦN_CHÚ_Ý",
        min_score=21,
        max_score=45,
        color="yellow",
        advice="Có một số dấu hiệu đáng chú ý. Hãy tìm hiểu kỹ về công ty trước khi ứng tuyển.",
    ),
    RiskLevel(
        label="ĐÁNG_NGHI_NGỜ",
        min_score=46,
        max_score=70,
        color="orange",
        advice="Tin tuyển dụng có nhiều dấu hiệu bất thường. Không nên cung cấp thông tin cá nhân hoặc nộp tiền.",
    ),
    RiskLevel(
        label="NGUY_HIỂM_CAO",
        min_score=71,
        max_score=100,
        color="red",
        advice="Tin tuyển dụng có nguy cơ lừa đảo rất cao. Không ứng tuyển và nên báo cáo.",
    ),
)


def get_risk_level(score: int) -> RiskLevel:
    """Trả về mức rủi ro tương ứng với điểm số."""
    clamped = max(0, min(score, 100))
    for level in RISK_LEVELS:
        if level.min_score <= clamped <= level.max_score:
            return level
    return RISK_LEVELS[-1]


# ── Ngưỡng kiểm tra lương (VND/tháng) ────────────────────────────────────────

@dataclass(frozen=True)
class SalaryThresholds:
    # Part-time ~20h/tuần: mức thực tế tối đa khoảng 15 triệu
    PART_TIME_REALISTIC_MAX: int = 15_000_000
    # Cảnh báo nhẹ nếu vượt ngưỡng này
    PART_TIME_WARNING: int = 20_000_000
    # Nghi ngờ cao nếu vượt ngưỡng này
    PART_TIME_SUSPICIOUS: int = 30_000_000
    # Lương tối thiểu theo quy định (vùng 1) 2024: ~4.68 triệu/tháng
    MIN_WAGE_MONTHLY: int = 4_680_000

    SALARY_WARNING_RISK: int = 10    # Điểm rủi ro cộng thêm nếu lương > WARNING
    SALARY_SUSPICIOUS_RISK: int = 25  # Điểm rủi ro cộng thêm nếu lương > SUSPICIOUS


# ── Quy tắc phân tích văn bản ─────────────────────────────────────────────────

@dataclass(frozen=True)
class TextRules:
    # Tối thiểu ký tự mô tả hợp lệ
    MIN_DESCRIPTION_LENGTH: int = 100
    # Tỷ lệ ký tự HOA tối đa cho phép (> ngưỡng = spam-like)
    MAX_UPPERCASE_RATIO: float = 0.35
    # Số lượng dấu "!" tối đa
    MAX_EXCLAMATION_MARKS: int = 5
    # Độ dài tiêu đề tối thiểu
    MIN_TITLE_LENGTH: int = 10
    # Độ dài tiêu đề tối đa hợp lý
    MAX_TITLE_LENGTH: int = 120

    SHORT_DESCRIPTION_RISK: int = 10
    UPPERCASE_SPAM_RISK: int = 10
    EXCLAMATION_SPAM_RISK: int = 8
    SHORT_TITLE_RISK: int = 5


# ── Quy tắc kiểm tra email công ty ───────────────────────────────────────────

@dataclass(frozen=True)
class ContactRules:
    PERSONAL_EMAIL_RISK: int = 20       # Email cá nhân thay vì email doanh nghiệp
    NO_CONTACT_INFO_RISK: int = 15      # Không có thông tin liên hệ rõ ràng
    PERSONAL_CHANNEL_RISK: int = 20     # Yêu cầu liên hệ qua Zalo/Telegram cá nhân


# ── Quy tắc kiểm tra công ty ─────────────────────────────────────────────────

@dataclass(frozen=True)
class CompanyRules:
    UNVERIFIED_TAX_RISK: int = 15       # Công ty chưa xác minh mã số thuế
    UNVERIFIED_EMAIL_RISK: int = 10     # Công ty chưa xác minh email
    LOW_COMPANY_SCORE_RISK: int = 20    # Điểm công ty thấp (< 40/100)
    LOW_COMPANY_SCORE_THRESHOLD: int = 40
