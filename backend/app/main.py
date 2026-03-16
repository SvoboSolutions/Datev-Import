from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.router import api_router
from app.core.config import settings
from app.core.db import engine, Base, SessionLocal
from app.core.security import hash_password

from app.models.user import User
from app.models.session import Session
from app.models.import_job import ImportJob
from app.models.employee import Employee
from app.models.employee_cost import EmployeeCost
from app.models.employee_profile import EmployeeProfile
from app.models.location import Location


app = FastAPI(title="CSV Reporting App")
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():

    # Admin-User bootstrappen, falls DB leer
    db = SessionLocal()
    try:
        existing = db.execute(
            select(User).where(User.username == settings.BOOTSTRAP_ADMIN_USERNAME)
        ).scalar_one_or_none()

        if existing is None:
            admin = User(
                username=settings.BOOTSTRAP_ADMIN_USERNAME,
                password_hash=hash_password(settings.BOOTSTRAP_ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}