# Unijob — Hướng dẫn sử dụng tính năng AI

Tài liệu này hướng dẫn cách chạy và sử dụng **2 tính năng AI** trong dự án:

| Tính năng | Module | Port |
|---|---|---|
| Chấm điểm uy tín công ty | `company_score/` | `2005` |
| Nhận diện tin tuyển dụng lừa đảo | `fraud_detection/` | `2006` |

---

## Cài đặt

```bash
pip install -r requirements.txt
```

---

## Cấu trúc thư mục

```
exe201/
├── company_score/
│   ├── __init__.py
│   ├── score_weights.py       # Trọng số và ngưỡng xếp loại
│   └── company_scorer.py      # Logic chấm điểm
│
├── fraud_detection/
│   ├── __init__.py
│   ├── keywords.py            # Danh sách từ khóa nghi vấn
│   ├── detection_rules.py     # Quy tắc và mức rủi ro
│   └── fraud_detector.py      # Logic phát hiện lừa đảo
│
├── apis/
│   ├── schemas/
│   │   ├── company_score.py       # Request/Response models
│   │   └── fraud_detection.py     # Request/Response models
│   ├── host_company_score.py      # FastAPI server chấm điểm
│   └── host_fraud_detection.py    # FastAPI server nhận diện lừa đảo
│
└── readme_instruction.md
```

---

## Tính năng 1 — Chấm điểm uy tín công ty

### Khởi động server

```bash
uvicorn apis.host_company_score:app --reload --host 0.0.0.0 --port 2005
```

Swagger UI: [http://localhost:2005/docs](http://localhost:2005/docs)

---

### Hệ thống điểm (tổng 100 điểm)

| Tiêu chí | Điểm tối đa | Điều kiện |
|---|---|---|
| Xác minh mã số thuế | 20 | `tax_code_verified = true` |
| Xác minh email | 10 | `email_verified = true` |
| Tên công ty | 5 | Có tên, không rỗng |
| Mô tả công ty | 5 | Mô tả ≥ 50 ký tự |
| Địa chỉ | 5 | Có địa chỉ |
| Website | 5 | Có URL website |
| Logo | 5 | Có URL logo |
| Tổng job đã đăng | 10 | Tuyến tính, đạt max khi ≥ 10 job |
| Job đăng trong 30 ngày | 10 | Tuyến tính, đạt max khi ≥ 5 job |
| Tỷ lệ phản hồi ứng viên | 15 | `response_rate` (0.0 → 1.0) |
| Đánh giá từ sinh viên | 10 | `average_rating` (1.0 → 5.0) |

**Xếp loại:**

| Điểm | Xếp loại | Mô tả |
|---|---|---|
| 80–100 | A | Xuất sắc — Công ty uy tín, đáng tin cậy |
| 60–79 | B | Tốt — Công ty đáng tin cậy |
| 40–59 | C | Trung bình — Cần cải thiện thêm |
| 20–39 | D | Yếu — Hồ sơ chưa đầy đủ |
| 0–19 | F | Chưa đạt — Cần hoàn thiện hồ sơ |

---

### API Endpoints

#### `POST /api/company-score` — Chấm điểm công ty

**Request body:**

```json
{
  "tax_code_verified": true,
  "email_verified": true,
  "company_name": "Công ty TNHH ABC",
  "description": "Chúng tôi là công ty chuyên cung cấp dịch vụ công nghệ thông tin tại Việt Nam với hơn 10 năm kinh nghiệm.",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "website": "https://abc.com.vn",
  "logo_url": "https://cdn.abc.com.vn/logo.png",
  "total_jobs_posted": 8,
  "recent_jobs_posted": 3,
  "response_rate": 0.85,
  "average_rating": 4.2,
  "total_reviews": 15
}
```

**Response:**

```json
{
  "total_score": 88,
  "max_score": 100,
  "percentage": 88.0,
  "grade": "A",
  "grade_label": "Xuất sắc - Công ty uy tín, đáng tin cậy",
  "breakdown": {
    "tax_code_score": 20,
    "email_score": 10,
    "verification_total": 30,
    "profile_name_score": 5,
    "profile_description_score": 5,
    "profile_address_score": 5,
    "profile_website_score": 5,
    "profile_logo_score": 5,
    "profile_total": 25,
    "jobs_total_score": 8,
    "jobs_recent_score": 6,
    "activity_total": 14,
    "response_rate_score": 13,
    "review_score": 8
  },
  "suggestions": [
    "Đăng thêm 2 tin tuyển dụng để đạt điểm hoạt động tối đa",
    "Cải thiện tỷ lệ phản hồi ứng viên (mục tiêu ≥ 80%)"
  ]
}
```

#### `GET /api/company-score/weights` — Xem cấu hình trọng số

```bash
curl http://localhost:2005/api/company-score/weights
```

---

### Sử dụng trực tiếp bằng Python

```python
from company_score import CompanyScorer
from company_score.company_scorer import CompanyData

scorer = CompanyScorer()

company = CompanyData(
    tax_code_verified=True,
    email_verified=True,
    company_name="Công ty TNHH ABC",
    description="Mô tả công ty ít nhất 50 ký tự để được tính điểm đầy đủ.",
    address="123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    website="https://abc.com.vn",
    logo_url="https://cdn.abc.com.vn/logo.png",
    total_jobs_posted=8,
    recent_jobs_posted=3,
    response_rate=0.85,       # 85%
    average_rating=4.2,       # Thang 1-5
    total_reviews=15,
)

result = scorer.calculate_score(company)
print(f"Điểm: {result.total_score}/100 — Xếp loại: {result.grade}")
print(f"Gợi ý cải thiện: {result.suggestions}")
```

---

## Tính năng 2 — Nhận diện tin tuyển dụng lừa đảo

### Khởi động server

```bash
uvicorn apis.host_fraud_detection:app --reload --host 0.0.0.0 --port 2006
```

Swagger UI: [http://localhost:2006/docs](http://localhost:2006/docs)

---

### Hệ thống điểm rủi ro (0–100)

| Điểm | Mức rủi ro | Màu | Ý nghĩa |
|---|---|---|---|
| 0–20 | AN_TOÀN | 🟢 green | Tin đăng có vẻ đáng tin cậy |
| 21–45 | CẦN_CHÚ_Ý | 🟡 yellow | Có một số dấu hiệu cần xem xét |
| 46–70 | ĐÁNG_NGHI_NGỜ | 🟠 orange | Nhiều bất thường, không nộp tiền hay thông tin cá nhân |
| 71–100 | NGUY_HIỂM_CAO | 🔴 red | Nguy cơ lừa đảo rất cao, không ứng tuyển |

### 5 lớp phân tích

| Lớp | Điểm tối đa | Mô tả |
|---|---|---|
| Từ khóa nghi vấn | 60 | 8 nhóm: yêu cầu tiền cọc, thu nhập ảo, đa cấp, nội dung vi phạm pháp luật... |
| Lương bất thường | 25 | Part-time > 20 triệu/tháng: cảnh báo; > 30 triệu: nghi ngờ cao |
| Chất lượng văn bản | 25 | Mô tả quá ngắn, spam chữ HOA, quá nhiều dấu `!` |
| Thông tin liên hệ | 30 | Email cá nhân (Gmail/Yahoo), thiếu liên hệ, yêu cầu Zalo cá nhân |
| Độ tin cậy công ty | 35 | Chưa xác minh MST/email, điểm uy tín < 40/100 |

### 8 nhóm từ khóa nghi vấn

| Nhóm | Điểm | Ví dụ từ khóa |
|---|---|---|
| Yêu cầu tiền trước | 35 | "đặt cọc", "phí đào tạo", "phí đăng ký" |
| Thu nhập bất thường | 25 | "thu nhập khủng", "không giới hạn thu nhập", "100 triệu" |
| Tuyển số lượng lớn | 15 | "tuyển gấp 500", "tuyển không giới hạn" |
| Đa cấp / kim tự tháp | 30 | "hoa hồng giới thiệu", "tuyến dưới", "đa cấp" |
| Liên hệ kênh cá nhân | 20 | "inbox facebook", "liên hệ telegram" |
| Công việc mơ hồ | 20 | "việc nhẹ lương cao", "ai cũng làm được" |
| Nội dung vi phạm pháp luật | 40 | "đánh bạc online", "tài khoản ngân hàng thuê" |
| Áp lực tâm lý | 15 | "cơ hội vàng", "chỉ còn vài suất", "đừng bỏ lỡ" |

---

### API Endpoints

#### `POST /api/detect-fraud` — Phân tích tin tuyển dụng

**Request body:**

```json
{
  "title": "Tuyển CTV bán hàng online - Việc nhẹ lương cao!!!",
  "description": "Thu nhập khủng 20-50 triệu/tháng. Không cần kinh nghiệm. Liên hệ Zalo cá nhân để biết thêm. Cơ hội vàng đừng bỏ lỡ!",
  "salary_min": 20000000,
  "salary_max": 50000000,
  "contact_email": "tuyen.dung@gmail.com",
  "contact_phone": "0901234567",
  "company_tax_verified": false,
  "company_email_verified": false,
  "company_score": 12
}
```

**Response:**

```json
{
  "risk_score": 100,
  "risk_level": "NGUY_HIỂM_CAO",
  "risk_color": "red",
  "advice": "Tin tuyển dụng có nguy cơ lừa đảo rất cao. Không ứng tuyển và nên báo cáo.",
  "is_suspicious": true,
  "red_flags": [
    "[Từ khóa nghi vấn] Thu nhập quá cao: \"thu nhập khủng\", \"không giới hạn thu nhập\"",
    "[Lương bất thường] Mức lương 50,000,000 VND/tháng quá cao so với thực tế part-time",
    "[Liên hệ] Email liên hệ là tài khoản cá nhân (tuyen.dung@gmail.com)",
    "[Công ty] Công ty chưa xác minh mã số thuế"
  ],
  "breakdown": {
    "keyword_risk": 60,
    "salary_risk": 25,
    "text_quality_risk": 8,
    "contact_risk": 20,
    "company_trust_risk": 35,
    ...
  }
}
```

#### `GET /api/detect-fraud/rules` — Xem toàn bộ quy tắc

```bash
curl http://localhost:2006/api/detect-fraud/rules
```

---

### Sử dụng trực tiếp bằng Python

```python
from fraud_detection import FraudDetector
from fraud_detection.fraud_detector import JobPostingData

detector = FraudDetector()

job = JobPostingData(
    title="Tuyển CTV bán hàng online - Việc nhẹ lương cao!!!",
    description=(
        "Thu nhập khủng từ 20-50 triệu/tháng không giới hạn. "
        "Chỉ cần điện thoại, không cần kinh nghiệm. "
        "Liên hệ Zalo cá nhân để biết thêm chi tiết. "
        "Cơ hội vàng đừng bỏ lỡ!"
    ),
    salary_min=20_000_000,
    salary_max=50_000_000,
    contact_email="tuyen.dung@gmail.com",
    contact_phone="0901234567",
    company_tax_verified=False,
    company_email_verified=False,
    company_score=12,
)

result = detector.analyze(job)

print(f"Điểm rủi ro : {result.risk_score}/100")
print(f"Mức rủi ro  : {result.risk_level}")
print(f"Đáng ngờ?   : {result.is_suspicious}")
print(f"Lời khuyên  : {result.advice}")
print(f"\nCác cảnh báo ({len(result.red_flags)}):")
for flag in result.red_flags:
    print(f"  ⚠ {flag}")
```

---

## Kết hợp 2 tính năng

Hai tính năng có thể kết hợp với nhau: điểm uy tín công ty (`company_score`) được truyền thẳng vào bộ phân tích lừa đảo qua trường `company_score` để tăng độ chính xác.

```python
from company_score import CompanyScorer
from company_score.company_scorer import CompanyData
from fraud_detection import FraudDetector
from fraud_detection.fraud_detector import JobPostingData

# Bước 1: Chấm điểm công ty
scorer = CompanyScorer()
company = CompanyData(tax_code_verified=True, email_verified=False, company_name="Startup XYZ")
score_result = scorer.calculate_score(company)

# Bước 2: Dùng điểm công ty khi phân tích tin tuyển dụng
detector = FraudDetector()
job = JobPostingData(
    title="Tuyển nhân viên kho bán thời gian",
    description="Làm việc tại kho hàng, ca tối từ 18h-22h, hỗ trợ đồng phục và bữa ăn.",
    salary_max=5_000_000,
    contact_email="hr@startupxyz.vn",
    company_tax_verified=company.tax_code_verified,
    company_email_verified=company.email_verified,
    company_score=score_result.total_score,   # Truyền điểm uy tín vào đây
)
fraud_result = detector.analyze(job)

print(f"Điểm công ty : {score_result.total_score}/100 ({score_result.grade})")
print(f"Rủi ro tin đăng: {fraud_result.risk_score}/100 ({fraud_result.risk_level})")
```

---

## Chạy cả 2 server cùng lúc

```bash
# Terminal 1 — Company Score (port 2005)
uvicorn apis.host_company_score:app --reload --host 0.0.0.0 --port 2005

# Terminal 2 — Fraud Detection (port 2006)
uvicorn apis.host_fraud_detection:app --reload --host 0.0.0.0 --port 2006
```

| Service | URL |
|---|---|
| Company Score API | http://localhost:2005/docs |
| Fraud Detection API | http://localhost:2006/docs |
