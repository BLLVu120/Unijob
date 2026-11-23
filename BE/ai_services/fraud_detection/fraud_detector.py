"""
FraudDetector - Phát hiện tin tuyển dụng lừa đảo trên nền tảng Unijob.

Phân tích 5 nhóm tiêu chí:
1. Từ khóa nghi vấn trong tiêu đề & mô tả
2. Mức lương bất thường
3. Chất lượng văn bản (spam-like)
4. Thông tin liên hệ đáng ngờ
5. Mức độ tin cậy công ty
"""

import re
from dataclasses import dataclass, field
from typing import Optional

from .keywords import ALL_KEYWORD_GROUPS, PERSONAL_EMAIL_DOMAINS, KeywordGroup
from .detection_rules import (
    SalaryThresholds,
    TextRules,
    ContactRules,
    CompanyRules,
    RiskLevel,
    get_risk_level,
)


# ── Dữ liệu đầu vào ──────────────────────────────────────────────────────────

@dataclass
class JobPostingData:
    """
    Dữ liệu tin tuyển dụng cần kiểm tra.
    """
    # Nội dung bài đăng
    title: str
    description: str

    # Thông tin lương (VND/tháng, None nếu không rõ)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

    # Thông tin liên hệ
    contact_email: Optional[str] = None   # Email liên hệ
    contact_phone: Optional[str] = None   # Số điện thoại liên hệ

    # Thông tin công ty (lấy từ hệ thống nếu có)
    company_tax_verified: bool = False
    company_email_verified: bool = False
    company_score: Optional[int] = None   # Điểm uy tín công ty (0-100)


# ── Kết quả phân tích ─────────────────────────────────────────────────────────

@dataclass
class KeywordFinding:
    """Một từ khóa nghi vấn được tìm thấy."""
    group_name: str
    group_description: str
    matched_keywords: list[str]
    risk_contribution: int


@dataclass
class FraudAnalysisBreakdown:
    """Chi tiết điểm rủi ro từng nhóm tiêu chí."""

    # Từ khóa nghi vấn
    keyword_findings: list[KeywordFinding] = field(default_factory=list)
    keyword_risk: int = 0

    # Mức lương
    salary_risk: int = 0
    salary_note: str = ""

    # Chất lượng văn bản
    text_quality_risk: int = 0
    text_quality_notes: list[str] = field(default_factory=list)

    # Thông tin liên hệ
    contact_risk: int = 0
    contact_notes: list[str] = field(default_factory=list)

    # Độ tin cậy công ty
    company_trust_risk: int = 0
    company_trust_notes: list[str] = field(default_factory=list)

    @property
    def total_risk(self) -> int:
        return min(
            100,
            self.keyword_risk
            + self.salary_risk
            + self.text_quality_risk
            + self.contact_risk
            + self.company_trust_risk,
        )


@dataclass
class FraudDetectionResult:
    """Kết quả nhận diện tin tuyển dụng lừa đảo."""
    risk_score: int
    risk_level: str
    risk_color: str
    advice: str
    is_suspicious: bool           # True nếu risk_score >= 46
    breakdown: FraudAnalysisBreakdown
    red_flags: list[str]          # Các cảnh báo tóm tắt


# ── Lớp phát hiện chính ──────────────────────────────────────────────────────

class FraudDetector:
    """
    Phát hiện tin tuyển dụng lừa đảo dựa trên quy tắc đa lớp.

    Điểm rủi ro: 0–100
    - 0–20:   An toàn
    - 21–45:  Cần chú ý
    - 46–70:  Đáng nghi ngờ
    - 71–100: Nguy hiểm cao
    """

    def __init__(
        self,
        salary_rules: Optional[SalaryThresholds] = None,
        text_rules: Optional[TextRules] = None,
        contact_rules: Optional[ContactRules] = None,
        company_rules: Optional[CompanyRules] = None,
    ):
        self.salary_rules = salary_rules or SalaryThresholds()
        self.text_rules = text_rules or TextRules()
        self.contact_rules = contact_rules or ContactRules()
        self.company_rules = company_rules or CompanyRules()

    def analyze(self, job: JobPostingData) -> FraudDetectionResult:
        """
        Phân tích toàn diện một tin tuyển dụng.

        Args:
            job: Dữ liệu tin tuyển dụng cần kiểm tra

        Returns:
            FraudDetectionResult với điểm rủi ro và chi tiết phân tích
        """
        full_text = self._normalize(f"{job.title} {job.description}")
        breakdown = FraudAnalysisBreakdown()

        self._analyze_keywords(full_text, breakdown)
        self._analyze_salary(job, breakdown)
        self._analyze_text_quality(job, full_text, breakdown)
        self._analyze_contact(job, full_text, breakdown)
        self._analyze_company_trust(job, breakdown)

        risk_score = breakdown.total_risk
        risk_level_obj = get_risk_level(risk_score)
        red_flags = self._collect_red_flags(breakdown)

        return FraudDetectionResult(
            risk_score=risk_score,
            risk_level=risk_level_obj.label,
            risk_color=risk_level_obj.color,
            advice=risk_level_obj.advice,
            is_suspicious=risk_score >= 46,
            breakdown=breakdown,
            red_flags=red_flags,
        )

    # ── Phân tích từ khóa ────────────────────────────────────────────────────

    def _analyze_keywords(self, normalized_text: str, breakdown: FraudAnalysisBreakdown) -> None:
        total_keyword_risk = 0

        for group in ALL_KEYWORD_GROUPS:
            matched = [kw for kw in group.keywords if kw in normalized_text]
            if not matched:
                continue

            # Mỗi nhóm chỉ tính điểm 1 lần dù khớp nhiều từ
            finding = KeywordFinding(
                group_name=group.name,
                group_description=group.description,
                matched_keywords=matched,
                risk_contribution=group.risk_weight,
            )
            breakdown.keyword_findings.append(finding)
            total_keyword_risk += group.risk_weight

        # Giới hạn tối đa đóng góp từ từ khóa
        breakdown.keyword_risk = min(total_keyword_risk, 60)

    # ── Phân tích lương ──────────────────────────────────────────────────────

    def _analyze_salary(self, job: JobPostingData, breakdown: FraudAnalysisBreakdown) -> None:
        r = self.salary_rules

        # Không có thông tin lương - không thêm điểm rủi ro
        if job.salary_max is None and job.salary_min is None:
            return

        salary = job.salary_max or job.salary_min
        if salary is None:
            return

        if salary > r.PART_TIME_SUSPICIOUS:
            breakdown.salary_risk = r.SALARY_SUSPICIOUS_RISK
            breakdown.salary_note = (
                f"Mức lương {salary:,} VND/tháng quá cao so với thực tế part-time "
                f"(ngưỡng nghi ngờ: {r.PART_TIME_SUSPICIOUS:,} VND)"
            )
        elif salary > r.PART_TIME_WARNING:
            breakdown.salary_risk = r.SALARY_WARNING_RISK
            breakdown.salary_note = (
                f"Mức lương {salary:,} VND/tháng cao hơn mức thực tế thông thường "
                f"cho công việc part-time (cảnh báo: {r.PART_TIME_WARNING:,} VND)"
            )

    # ── Phân tích chất lượng văn bản ─────────────────────────────────────────

    def _analyze_text_quality(
        self, job: JobPostingData, normalized_text: str, breakdown: FraudAnalysisBreakdown
    ) -> None:
        r = self.text_rules
        notes = breakdown.text_quality_notes
        risk = 0

        # Mô tả quá ngắn
        if len(job.description.strip()) < r.MIN_DESCRIPTION_LENGTH:
            risk += r.SHORT_DESCRIPTION_RISK
            notes.append(
                f"Mô tả quá ngắn ({len(job.description.strip())} ký tự, "
                f"tối thiểu {r.MIN_DESCRIPTION_LENGTH})"
            )

        # Tỷ lệ chữ hoa cao (spam-like)
        letters = [c for c in job.description if c.isalpha()]
        if letters:
            upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
            if upper_ratio > r.MAX_UPPERCASE_RATIO:
                risk += r.UPPERCASE_SPAM_RISK
                notes.append(
                    f"Tỷ lệ chữ HOA quá cao ({upper_ratio:.0%}), "
                    "có dấu hiệu spam"
                )

        # Quá nhiều dấu chấm than
        exclamation_count = job.title.count("!") + job.description.count("!")
        if exclamation_count > r.MAX_EXCLAMATION_MARKS:
            risk += r.EXCLAMATION_SPAM_RISK
            notes.append(
                f"Quá nhiều dấu '!' ({exclamation_count} lần), "
                "có thể là nội dung giật tít"
            )

        # Tiêu đề quá ngắn
        if len(job.title.strip()) < r.MIN_TITLE_LENGTH:
            risk += r.SHORT_TITLE_RISK
            notes.append(f"Tiêu đề quá ngắn ({len(job.title.strip())} ký tự)")

        breakdown.text_quality_risk = min(risk, 25)

    # ── Phân tích thông tin liên hệ ──────────────────────────────────────────

    def _analyze_contact(
        self, job: JobPostingData, normalized_text: str, breakdown: FraudAnalysisBreakdown
    ) -> None:
        r = self.contact_rules
        notes = breakdown.contact_notes
        risk = 0

        # Email cá nhân thay vì email doanh nghiệp
        if job.contact_email:
            domain = job.contact_email.split("@")[-1].lower().strip()
            if domain in PERSONAL_EMAIL_DOMAINS:
                risk += r.PERSONAL_EMAIL_RISK
                notes.append(
                    f"Email liên hệ là tài khoản cá nhân ({job.contact_email}), "
                    "không phải email doanh nghiệp"
                )

        # Không có thông tin liên hệ
        if not job.contact_email and not job.contact_phone:
            risk += r.NO_CONTACT_INFO_RISK
            notes.append("Không có thông tin liên hệ rõ ràng (email hoặc số điện thoại)")

        # Yêu cầu liên hệ qua kênh cá nhân (phát hiện trong nội dung)
        personal_channel_patterns = [
            r"zalo\s*cá\s*nhân", r"inbox\s*facebook", r"nhắn\s*tin\s*facebook",
            r"liên\s*hệ\s*telegram", r"pm\s*(mình|tôi|để)",
        ]
        for pattern in personal_channel_patterns:
            if re.search(pattern, normalized_text):
                risk += r.PERSONAL_CHANNEL_RISK
                notes.append(
                    "Yêu cầu liên hệ qua kênh cá nhân (Zalo/Facebook/Telegram) "
                    "thay vì qua nền tảng"
                )
                break

        breakdown.contact_risk = min(risk, 30)

    # ── Phân tích độ tin cậy công ty ─────────────────────────────────────────

    def _analyze_company_trust(self, job: JobPostingData, breakdown: FraudAnalysisBreakdown) -> None:
        r = self.company_rules
        notes = breakdown.company_trust_notes
        risk = 0

        if not job.company_tax_verified:
            risk += r.UNVERIFIED_TAX_RISK
            notes.append("Công ty chưa xác minh mã số thuế")

        if not job.company_email_verified:
            risk += r.UNVERIFIED_EMAIL_RISK
            notes.append("Công ty chưa xác minh email doanh nghiệp")

        if job.company_score is not None and job.company_score < r.LOW_COMPANY_SCORE_THRESHOLD:
            risk += r.LOW_COMPANY_SCORE_RISK
            notes.append(
                f"Điểm uy tín công ty thấp ({job.company_score}/100, "
                f"ngưỡng tối thiểu: {r.LOW_COMPANY_SCORE_THRESHOLD})"
            )

        breakdown.company_trust_risk = min(risk, 35)

    # ── Tổng hợp cảnh báo ────────────────────────────────────────────────────

    def _collect_red_flags(self, breakdown: FraudAnalysisBreakdown) -> list[str]:
        flags: list[str] = []

        for finding in breakdown.keyword_findings:
            kw_list = ", ".join(f'"{kw}"' for kw in finding.matched_keywords[:3])
            flags.append(f"[Từ khóa nghi vấn] {finding.group_description}: {kw_list}")

        if breakdown.salary_note:
            flags.append(f"[Lương bất thường] {breakdown.salary_note}")

        flags.extend(f"[Văn bản] {note}" for note in breakdown.text_quality_notes)
        flags.extend(f"[Liên hệ] {note}" for note in breakdown.contact_notes)
        flags.extend(f"[Công ty] {note}" for note in breakdown.company_trust_notes)

        return flags

    # ── Tiện ích ─────────────────────────────────────────────────────────────

    @staticmethod
    def _normalize(text: str) -> str:
        """Chuẩn hóa văn bản về chữ thường để so sánh."""
        return text.lower().strip()
