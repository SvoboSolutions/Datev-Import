from fastapi import APIRouter, Depends, Response, HTTPException, Request
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.config import settings
from app.core.security import (
    verify_password,
    create_session,
    delete_session,
    get_user_by_session_token,
    get_current_user,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, UserOut

router = APIRouter()


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, response: Response, db: DbSession = Depends(get_db)):
    user = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    sess = create_session(db, user)

    # Dev-friendly Cookie Settings:
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=sess.token,
        httponly=True,
        samesite="lax",   # <- wichtig für local dev
        secure=False,     # <- wichtig für http dev
        path="/",
    )

    return UserOut(id=user.id, username=user.username, role=user.role)


@router.post("/logout")
def logout(request: Request, response: Response, db: DbSession = Depends(get_db)):
    token = request.cookies.get(settings.SESSION_COOKIE_NAME, "")
    if token:
        delete_session(db, token)

    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
def me(request: Request, db: DbSession = Depends(get_db)):
    token = request.cookies.get(settings.SESSION_COOKIE_NAME, "")
    user = get_user_by_session_token(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return UserOut(id=user.id, username=user.username, role=user.role)


@router.get("/protected-test")
def protected_test(user=Depends(get_current_user)):
    return {
        "message": "you are authenticated",
        "user": user.username,
        "role": user.role,
    }
