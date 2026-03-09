from sqlalchemy import exists, text
from db.connection import DB
from db.candidate import add_new_candidate
from db.emp import add_new_employer
def main():
    db = DB()
    db_connection = db.connect()
    engine = db_connection["engine"]
    
    add_new_candidate(engine, {
        "full_name": "Lap Hoang Van",
        "dob": "2004-09-04",
        "gender": "Nam",
        "email": "candidate@example.com",
        "password": "hashed_password_here",
        "phone_number": "0356463411",
        "address": "Binh Thanh, Ho Chi Minh City",
        "cid": "079095001234"
    })
    
    add_new_employer(engine, {
        "emp_name": "CÔNG TY TNHH PHẦN MỀM FPT HỒ CHÍ MINH",
        "address": "SLô T2, đường D1, khu công nghệ cao, Phường Tân Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam",
        "website": "https://fpt.com/vi",
        "tax_code": "0310634373",
        "email": "recruitment@fpt.com",
        "password": "12345678",
        "phone_number": "02473079999",
        "description": "FPT Software là công ty thành viên thuộc Tập đoàn FPT. Được thành lập từ năm 1999, FPT Software hiện là công ty chuyên cung cấp các dịch vụ và giải pháp phần mềm cho các khách hàng quốc tế, với hơn 28000 nhân viên, hiện diện tại 27 quốc gia trên toàn cầu. Nhiều năm liền, FPT Software được bình chọn là Nhà Tuyển dụng được yêu thích nhất và nằm trong TOP các công ty có môi trường làm việc tốt nhất châu Á.",    
        "scope": "Phần mềm",
        "representative_name": "TRẦN THỊ KIM PHƯỢNG",    
        "cid": "123456789"
    })
    
# Example usage:
if __name__ == "__main__":
    print(main())