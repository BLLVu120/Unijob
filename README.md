# Unijob: Nền tảng Tìm Việc An Toàn

## Tổng quan
Unijob là nền tảng tìm việc trực tuyến an toàn, tập trung vào sinh viên và người trẻ. Nó kết nối nhà tuyển dụng uy tín với ứng viên qua hệ thống xác minh nghiêm ngặt, giảm rủi ro lừa đảo và bảo vệ dữ liệu.

Dự án sử dụng kiến trúc microservices với Docker, bao gồm backend (Python), frontend, và database.

## Kiến trúc Chính
- **Backend**: Python với FastAPI/Flask, API endpoints, models, services, và tests.
- **Frontend**: React, giao diện tìm việc và quản lý hồ sơ.
- **Database**: PostgreSQL/MySQL, lưu trữ dữ liệu an toàn.
- **Container**: Docker Compose để triển khai dễ dàng.

## Tính năng Chính
- Xác minh danh tính và bảo mật (OTP, email).
- Tìm kiếm thông minh với AI gợi ý công việc.
- Quản lý hồ sơ và theo dõi ứng tuyển.
- Đánh giá nhà tuyển dụng.
- Giao diện responsive, đa ngôn ngữ.

## Mục tiêu
Giải quyết an ninh lao động trực tuyến, đặc biệt ở các nước đang phát triển. Giáo dục người dùng về quyền lợi và kỹ năng phỏng vấn.

Để bắt đầu: Clone repo, chạy `docker-compose up`, tham khảo docs/.

## Run API
1. Clone repository:
    > git clone
2. Access project directory:
   > cd unijob
3. Conda environment:
    > conda create -n unijob python=3.10.18
    
    > conda activate unijob
4. Install dependencies:
    > pip install -r requirements.txt
5. Build và chạy Docker Compose:
    > docker compose up -d
6. Access src/
   > cd src/
7. Run API
    > python -m api.v1
8. Access API tại http://0.0.0.0:8000/docs

## DB Management
1. Run Docker Compose:
    > docker compose up -d
2. Access link pgAdmin tại http://localhost:5050
3. Login với email:
4. Register Server với:
   - Name: unijob
   - Host name/address: postgres
   - Port: 5432 
   - Maintenance database: unijob_db
   - Username: unijob_user
   - Password: unijob_password
5. Quản lý database unijob_db qua pgAdmin