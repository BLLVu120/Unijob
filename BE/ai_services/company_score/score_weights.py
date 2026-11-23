from dataclasses import dataclass


@dataclass(frozen=True)
class ScoreWeights:
    """
    Trọng số điểm cho từng tiêu chí chấm điểm công ty.
    Tổng tối đa: 100 điểm
    """

    # Xác minh danh tính (30 điểm)
    TAX_CODE_VERIFIED: int = 20       # Đã xác minh mã số thuế
    EMAIL_VERIFIED: int = 10          # Đã xác minh email

    # Mức độ hoàn thiện hồ sơ (25 điểm)
    PROFILE_NAME: int = 5             # Tên công ty
    PROFILE_DESCRIPTION: int = 5      # Mô tả công ty (>= 50 ký tự)
    PROFILE_ADDRESS: int = 5          # Địa chỉ công ty
    PROFILE_WEBSITE: int = 5          # Website
    PROFILE_LOGO: int = 5             # Logo/avatar

    # Hoạt động đăng tuyển (20 điểm)
    JOBS_TOTAL_MAX: int = 10          # Điểm tối đa cho tổng số job đã đăng
    JOBS_TOTAL_CAP: int = 10          # Số job cần đạt để nhận điểm tối đa
    JOBS_RECENT_MAX: int = 10         # Điểm tối đa cho job đăng trong 30 ngày gần đây
    JOBS_RECENT_CAP: int = 5          # Số job gần đây cần đạt để nhận điểm tối đa

    # Tỷ lệ phản hồi ứng viên (15 điểm)
    RESPONSE_RATE_MAX: int = 15       # Điểm tối đa cho tỷ lệ phản hồi

    # Đánh giá từ sinh viên (10 điểm)
    REVIEW_MAX: int = 10              # Điểm tối đa từ đánh giá (rating 1-5 → 0-10)

    @property
    def total_max(self) -> int:
        return (
            self.TAX_CODE_VERIFIED
            + self.EMAIL_VERIFIED
            + self.PROFILE_NAME
            + self.PROFILE_DESCRIPTION
            + self.PROFILE_ADDRESS
            + self.PROFILE_WEBSITE
            + self.PROFILE_LOGO
            + self.JOBS_TOTAL_MAX
            + self.JOBS_RECENT_MAX
            + self.RESPONSE_RATE_MAX
            + self.REVIEW_MAX
        )


# Ngưỡng xếp loại
GRADE_THRESHOLDS: dict[str, tuple[int, int]] = {
    "A": (80, 100),
    "B": (60, 79),
    "C": (40, 59),
    "D": (20, 39),
    "F": (0, 19),
}

# Nhãn mô tả xếp loại
GRADE_LABELS: dict[str, str] = {
    "A": "Xuất sắc - Công ty uy tín, đáng tin cậy",
    "B": "Tốt - Công ty đáng tin cậy",
    "C": "Trung bình - Cần cải thiện thêm",
    "D": "Yếu - Hồ sơ chưa đầy đủ",
    "F": "Chưa đạt - Cần hoàn thiện hồ sơ",
}
