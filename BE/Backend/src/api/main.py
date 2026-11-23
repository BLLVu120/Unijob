import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.api.v1.candidate import router as candidate_router
from src.api.v1.admin import router as admin_router
from src.api.v1.employer import router as employer_router
from src.api.v1.job import router as job_router
from src.api.v1.message import router as message_router
from src.api.v1.transaction import router as transaction_router
from src.api.v1.feedback import router as feedback_router
from src.api.v1.interview import router as interview_router
from src.api.v1.application import router as application_router
from src.api.v1.verification import router as verification_router
from src.api.v1.payment import router as payment_router
import uvicorn
app = FastAPI(title="Job Platform API")

# Cho phép FE (Vite dev server) gọi API từ trình duyệt.
# Thêm origin khác qua biến môi trường CORS_ORIGINS, phân cách bằng dấu phẩy.
cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ file CV đã upload tại /cv/<tên file> (FE đổi /src/store/cv -> /cv)
os.makedirs("src/store/cv", exist_ok=True)
app.mount("/cv", StaticFiles(directory="src/store/cv"), name="cv")

# include router
app.include_router(candidate_router, prefix="/v1")
app.include_router(employer_router, prefix="/v1")
app.include_router(job_router, prefix="/v1")
app.include_router(application_router, prefix="/v1")
app.include_router(interview_router, prefix="/v1")
app.include_router(message_router, prefix="/v1")
app.include_router(feedback_router, prefix="/v1")
app.include_router(transaction_router, prefix="/v1")
app.include_router(admin_router, prefix="/v1")
app.include_router(verification_router, prefix="/v1")
app.include_router(payment_router, prefix="/v1")


if __name__ == "__main__":
    uvicorn.run(
        "src.api.main:app",   # file main.py : biến app
        host="0.0.0.0",
        port=8000,
        reload=True
    )