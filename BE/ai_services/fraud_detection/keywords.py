"""
Từ điển từ khóa nghi vấn lừa đảo trong tin tuyển dụng part-time.
Mỗi nhóm có trọng số rủi ro riêng (risk_weight).
"""

from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True)
class KeywordGroup:
    name: str
    description: str
    keywords: tuple[str, ...]
    risk_weight: int  # Điểm rủi ro cộng thêm mỗi khi nhóm này khớp


# ── Nhóm 1: Yêu cầu tiền trước ─────────────────────────────────────────────
MONEY_UPFRONT = KeywordGroup(
    name="money_upfront",
    description="Yêu cầu nộp tiền trước khi làm việc",
    keywords=(
        "đặt cọc", "phí đặt cọc", "phí tuyển dụng", "phí đào tạo",
        "phí ứng tuyển", "phí bảo lãnh", "phí nhập học", "nộp tiền trước",
        "đóng tiền", "phí xét duyệt", "phí hồ sơ", "tiền cọc",
        "phí thử việc", "phí đăng ký", "mua hàng mẫu", "nhập hàng",
    ),
    risk_weight=35,
)

# ── Nhóm 2: Thu nhập bất thường ─────────────────────────────────────────────
UNREALISTIC_INCOME = KeywordGroup(
    name="unrealistic_income",
    description="Thu nhập quá cao hoặc mơ hồ so với công việc",
    keywords=(
        "thu nhập khủng", "thu nhập triệu đô", "kiếm tiền siêu tốc",
        "thu nhập không giới hạn", "làm giàu nhanh", "thu nhập thụ động",
        "100 triệu", "200 triệu", "500 triệu", "chốt đơn kiếm tiền",
        "kiếm tiền online không cần làm gì", "ngồi nhà kiếm tiền",
        "kiếm 50 triệu mỗi tháng", "thu nhập 30 triệu từ part-time",
        "lương cao nhất thị trường", "tiền về tài khoản ngay",
        "thu nhập tùy ý", "không giới hạn thu nhập",
    ),
    risk_weight=25,
)

# ── Nhóm 3: Tuyển dụng số lượng lớn bất thường ──────────────────────────────
MASS_RECRUITMENT = KeywordGroup(
    name="mass_recruitment",
    description="Tuyển số lượng lớn bất thường hoặc tuyển gấp không có lý do",
    keywords=(
        "tuyển gấp 100", "tuyển gấp 200", "tuyển gấp 500", "tuyển gấp 1000",
        "tuyển số lượng lớn", "tuyển không giới hạn", "tuyển gấp toàn quốc",
        "tuyển ồ ạt", "tuyển ngay hôm nay", "cần gấp 50 người",
        "tuyển toàn thời gian online ngay",
    ),
    risk_weight=15,
)

# ── Nhóm 4: Mạng lưới đa cấp ─────────────────────────────────────────────────
PYRAMID_SCHEME = KeywordGroup(
    name="pyramid_scheme",
    description="Dấu hiệu kinh doanh đa cấp hoặc mô hình kim tự tháp",
    keywords=(
        "giới thiệu thêm thành viên", "hoa hồng giới thiệu", "phát triển hệ thống",
        "xây dựng đội nhóm", "cấu trúc đội nhóm", "thu nhập từ hoa hồng tuyến dưới",
        "kinh doanh theo mạng", "mlm", "đa cấp", "mô hình kim tự tháp",
        "network marketing", "mời gọi thành viên", "tuyến dưới", "downline",
        "nhóm bán hàng online", "cộng tác viên bán hàng online không lương cứng",
    ),
    risk_weight=30,
)

# ── Nhóm 5: Liên lạc qua kênh cá nhân ───────────────────────────────────────
PERSONAL_CONTACT = KeywordGroup(
    name="personal_contact",
    description="Yêu cầu liên hệ qua kênh cá nhân thay vì qua nền tảng",
    keywords=(
        "liên hệ zalo cá nhân", "inbox facebook", "nhắn tin facebook",
        "liên hệ telegram", "liên hệ trực tiếp qua zalo",
        "trao đổi qua zalo", "không phỏng vấn", "không cần gặp mặt",
        "phỏng vấn qua zalo", "ứng tuyển qua telegram",
        "liên hệ ngay để biết thêm", "pm để biết thêm chi tiết",
    ),
    risk_weight=20,
)

# ── Nhóm 6: Mô tả công việc mơ hồ ───────────────────────────────────────────
VAGUE_JOB = KeywordGroup(
    name="vague_job",
    description="Mô tả công việc quá chung chung hoặc mơ hồ",
    keywords=(
        "việc nhẹ lương cao", "không cần kinh nghiệm không cần bằng cấp",
        "ai cũng làm được", "công việc đơn giản", "làm việc tại nhà thoải mái",
        "tự do thời gian tuyệt đối", "không cần đến văn phòng",
        "chỉ cần điện thoại", "chỉ cần máy tính", "công việc bí mật",
        "không tiết lộ công việc", "liên hệ để biết công việc cụ thể",
        "việc làm online bí mật", "cơ hội đặc biệt",
    ),
    risk_weight=20,
)

# ── Nhóm 7: Nội dung nhạy cảm / vi phạm pháp luật ───────────────────────────
ILLEGAL_CONTENT = KeywordGroup(
    name="illegal_content",
    description="Nội dung vi phạm pháp luật hoặc đạo đức",
    keywords=(
        "người mẫu ảnh nóng", "nhân viên tiếp khách", "tiếp rượu",
        "massage trị liệu đặc biệt", "dịch vụ người lớn",
        "đánh bạc online", "cá độ", "sòng bạc online",
        "rút tiền ảo", "hack account", "clone sim",
        "sim rác", "tài khoản ngân hàng thuê",
        "thuê cmnd", "thuê căn cước", "bán thông tin cá nhân",
        "cộng tác viên đánh giá giả", "review ảo",
    ),
    risk_weight=40,
)

# ── Nhóm 8: Áp lực và thao túng ─────────────────────────────────────────────
PRESSURE_TACTICS = KeywordGroup(
    name="pressure_tactics",
    description="Tạo áp lực hoặc thao túng tâm lý ứng viên",
    keywords=(
        "chỉ còn vài suất", "cơ hội cuối cùng", "hết hạn hôm nay",
        "đừng bỏ lỡ", "cơ hội vàng", "không được bỏ qua",
        "đăng ký ngay kẻo hết", "số lượng có hạn",
        "ưu tiên người nhanh", "ai chậm sẽ mất cơ hội",
        "cam kết hoàn tiền 100%", "đảm bảo việc làm ngay",
        "không rủi ro", "chắc chắn có thu nhập",
    ),
    risk_weight=15,
)


ALL_KEYWORD_GROUPS: tuple[KeywordGroup, ...] = (
    MONEY_UPFRONT,
    UNREALISTIC_INCOME,
    MASS_RECRUITMENT,
    PYRAMID_SCHEME,
    PERSONAL_CONTACT,
    VAGUE_JOB,
    ILLEGAL_CONTENT,
    PRESSURE_TACTICS,
)

# Email cá nhân phổ biến (không phải email doanh nghiệp)
PERSONAL_EMAIL_DOMAINS: frozenset[str] = frozenset({
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "live.com", "mail.com", "protonmail.com",
    "ymail.com",
})
