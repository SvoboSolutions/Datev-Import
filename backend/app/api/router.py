from fastapi import APIRouter
from app.api import auth, imports, dashboard, employees

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
