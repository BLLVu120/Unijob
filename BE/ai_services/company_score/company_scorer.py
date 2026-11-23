from dataclasses import dataclass, field
from typing import Optional
from .score_weights import ScoreWeights, GRADE_THRESHOLDS, GRADE_LABELS


@dataclass
class CompanyData:
    """
    Dữ liệu đầu vào để chấm điểm công ty.
    """
    # Xác minh danh tính
    tax_code_verified: bool = False
    email_verified: bool = False

    # Hồ sơ công ty
    company_name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

    # Hoạt động đăng tuyển
    total_jobs_posted: int = 0
    recent_jobs_posted: int = 0  # Số job đăng trong 30 ngày gần đây

    # Tương tác với ứng viên (0.0 - 1.0)
    response_rate: float = 0.0

    # Đánh giá từ sinh viên (1.0 - 5.0, None nếu chưa có đánh giá)
    average_rating: Optional[float] = None
    total_reviews: int = 0


@dataclass
class ScoreBreakdown:
    """
    Chi tiết điểm từng tiêu chí.
    """
    # Xác minh danh tính
    tax_code_score: int = 0
    email_score: int = 0

    # Hồ sơ công ty
    profile_name_score: int = 0
    profile_description_score: int = 0
    profile_address_score: int = 0
    profile_website_score: int = 0
    profile_logo_score: int = 0

    # Hoạt động đăng tuyển
    jobs_total_score: int = 0
    jobs_recent_score: int = 0

    # Tỷ lệ phản hồi
    response_rate_score: int = 0

    # Đánh giá từ sinh viên
    review_score: int = 0

    @property
    def verification_total(self) -> int:
        return self.tax_code_score + self.email_score

    @property
    def profile_total(self) -> int:
        return (
            self.profile_name_score
            + self.profile_description_score
            + self.profile_address_score
            + self.profile_website_score
            + self.profile_logo_score
        )

    @property
    def activity_total(self) -> int:
        return self.jobs_total_score + self.jobs_recent_score

    @property
    def total(self) -> int:
        return (
            self.verification_total
            + self.profile_total
            + self.activity_total
            + self.response_rate_score
            + self.review_score
        )


@dataclass
class ScoreResult:
    """
    Kết quả chấm điểm công ty.
    """
    total_score: int
    max_score: int
    percentage: float
    grade: str
    grade_label: str
    breakdown: ScoreBreakdown
    suggestions: list[str] = field(default_factory=list)


class CompanyScorer:
    """
    Tính điểm uy tín cho công ty trên nền tảng Unijob.

    Tiêu chí chấm điểm (tổng 100 điểm):
    - Xác minh danh tính:    30 điểm (mã số thuế 20đ + email 10đ)
    - Hồ sơ công ty:         25 điểm (tên, mô tả, địa chỉ, website, logo)
    - Hoạt động đăng tuyển:  20 điểm (tổng job + job gần đây)
    - Tỷ lệ phản hồi:        15 điểm
    - Đánh giá sinh viên:    10 điểm
    """

    def __init__(self, weights: Optional[ScoreWeights] = None):
        self.weights = weights or ScoreWeights()

    def calculate_score(self, company: CompanyData) -> ScoreResult:
        """
        Tính điểm uy tín cho công ty.

        Args:
            company: Dữ liệu công ty cần chấm điểm

        Returns:
            ScoreResult chứa điểm tổng, chi tiết và xếp loại
        """
        breakdown = ScoreBreakdown()

        breakdown.tax_code_score = self._score_tax_code(company)
        breakdown.email_score = self._score_email(company)

        breakdown.profile_name_score = self._score_profile_name(company)
        breakdown.profile_description_score = self._score_profile_description(company)
        breakdown.profile_address_score = self._score_profile_address(company)
        breakdown.profile_website_score = self._score_profile_website(company)
        breakdown.profile_logo_score = self._score_profile_logo(company)

        breakdown.jobs_total_score = self._score_jobs_total(company)
        breakdown.jobs_recent_score = self._score_jobs_recent(company)

        breakdown.response_rate_score = self._score_response_rate(company)

        breakdown.review_score = self._score_reviews(company)

        total = breakdown.total
        max_score = self.weights.total_max
        percentage = round(total / max_score * 100, 1) if max_score > 0 else 0.0
        grade = self._calculate_grade(total)
        suggestions = self._generate_suggestions(company, breakdown)

        return ScoreResult(
            total_score=total,
            max_score=max_score,
            percentage=percentage,
            grade=grade,
            grade_label=GRADE_LABELS[grade],
            breakdown=breakdown,
            suggestions=suggestions,
        )

    # --- Xác minh danh tính ---

    def _score_tax_code(self, company: CompanyData) -> int:
        return self.weights.TAX_CODE_VERIFIED if company.tax_code_verified else 0

    def _score_email(self, company: CompanyData) -> int:
        return self.weights.EMAIL_VERIFIED if company.email_verified else 0

    # --- Hồ sơ công ty ---

    def _score_profile_name(self, company: CompanyData) -> int:
        return self.weights.PROFILE_NAME if company.company_name and company.company_name.strip() else 0

    def _score_profile_description(self, company: CompanyData) -> int:
        if company.description and len(company.description.strip()) >= 50:
            return self.weights.PROFILE_DESCRIPTION
        return 0

    def _score_profile_address(self, company: CompanyData) -> int:
        return self.weights.PROFILE_ADDRESS if company.address and company.address.strip() else 0

    def _score_profile_website(self, company: CompanyData) -> int:
        return self.weights.PROFILE_WEBSITE if company.website and company.website.strip() else 0

    def _score_profile_logo(self, company: CompanyData) -> int:
        return self.weights.PROFILE_LOGO if company.logo_url and company.logo_url.strip() else 0

    # --- Hoạt động đăng tuyển ---

    def _score_jobs_total(self, company: CompanyData) -> int:
        if company.total_jobs_posted <= 0:
            return 0
        ratio = min(company.total_jobs_posted / self.weights.JOBS_TOTAL_CAP, 1.0)
        return round(ratio * self.weights.JOBS_TOTAL_MAX)

    def _score_jobs_recent(self, company: CompanyData) -> int:
        if company.recent_jobs_posted <= 0:
            return 0
        ratio = min(company.recent_jobs_posted / self.weights.JOBS_RECENT_CAP, 1.0)
        return round(ratio * self.weights.JOBS_RECENT_MAX)

    # --- Tỷ lệ phản hồi ---

    def _score_response_rate(self, company: CompanyData) -> int:
        rate = max(0.0, min(company.response_rate, 1.0))
        return round(rate * self.weights.RESPONSE_RATE_MAX)

    # --- Đánh giá từ sinh viên ---

    def _score_reviews(self, company: CompanyData) -> int:
        if company.average_rating is None or company.total_reviews == 0:
            return 0
        # Rating 1-5 → điểm 0-10
        normalized = (max(1.0, min(company.average_rating, 5.0)) - 1) / 4
        return round(normalized * self.weights.REVIEW_MAX)

    # --- Xếp loại ---

    def _calculate_grade(self, total_score: int) -> str:
        for grade, (low, high) in GRADE_THRESHOLDS.items():
            if low <= total_score <= high:
                return grade
        return "F"

    # --- Gợi ý cải thiện ---

    def _generate_suggestions(
        self, company: CompanyData, breakdown: ScoreBreakdown
    ) -> list[str]:
        suggestions = []

        if not company.tax_code_verified:
            suggestions.append("Xác minh mã số thuế để tăng độ tin cậy (+20 điểm)")
        if not company.email_verified:
            suggestions.append("Xác minh địa chỉ email doanh nghiệp (+10 điểm)")
        if breakdown.profile_description_score == 0:
            suggestions.append("Thêm mô tả công ty (tối thiểu 50 ký tự) (+5 điểm)")
        if breakdown.profile_address_score == 0:
            suggestions.append("Cập nhật địa chỉ công ty (+5 điểm)")
        if breakdown.profile_website_score == 0:
            suggestions.append("Thêm website chính thức của công ty (+5 điểm)")
        if breakdown.profile_logo_score == 0:
            suggestions.append("Tải lên logo công ty (+5 điểm)")
        if company.total_jobs_posted < self.weights.JOBS_TOTAL_CAP:
            remaining = self.weights.JOBS_TOTAL_CAP - company.total_jobs_posted
            suggestions.append(
                f"Đăng thêm {remaining} tin tuyển dụng để đạt điểm hoạt động tối đa"
            )
        if company.recent_jobs_posted == 0:
            suggestions.append("Đăng tin tuyển dụng mới trong 30 ngày để duy trì hoạt động")
        if company.response_rate < 0.8:
            suggestions.append("Cải thiện tỷ lệ phản hồi ứng viên (mục tiêu ≥ 80%)")
        if company.average_rating is None:
            suggestions.append("Khuyến khích sinh viên để lại đánh giá sau khi hoàn thành công việc")
        elif company.average_rating < 4.0:
            suggestions.append("Cải thiện trải nghiệm làm việc để nâng cao đánh giá từ sinh viên")

        return suggestions
