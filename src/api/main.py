from fastapi import FastAPI
from src.api.v1.candidate import router as candidate_router
from src.api.v1.admin import router as admin_router
from src.api.v1.employer import router as employer_router
from src.api.v1.job import router as job_router
from src.api.v1.message import router as message_router
from src.api.v1.transaction import router as transaction_router
from src.api.v1.feedback import router as feedback_router
from src.api.v1.interview import router as interview_router
from src.api.v1.application import router as application_router
import uvicorn
app = FastAPI(title="Job Platform API")

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


if __name__ == "__main__":
    uvicorn.run(
        "src.api.main:app",   # file main.py : biến app
        host="0.0.0.0",
        port=8000,
        reload=True
    )