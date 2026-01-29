import secrets
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Request
from app.core.db import get_db
from passlib.context import CryptContext
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select

from app.core.config import settings
from app.models.session import Session
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_session(db: DbSession, user: User) -> Session:
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    expires = now + timedelta(days=settings.SESSION_TTL_DAYS)

    s = Session(token=token, user_id=user.id, created_at=now, expires_at=expires)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def get_user_by_session_token(db: DbSession, token: str) -> User | None:
    if not token:
        return None

    stmt = select(Session).where(Session.token == token)
    sess = db.execute(stmt).scalar_one_or_none()
    if sess is None:
        return None

    if sess.expires_at < datetime.utcnow():
        # abgelaufene Session aufräumen
        db.delete(sess)
        db.commit()
        return None

    user = db.get(User, sess.user_id)
    if user is None or not user.is_active:
        return None

    return user


def delete_session(db: DbSession, token: str) -> None:
    if not token:
        return
    stmt = select(Session).where(Session.token == token)
    sess = db.execute(stmt).scalar_one_or_none()
    if sess:
        db.delete(sess)
        db.commit()

def get_current_user(
    request: Request,
    db: DbSession = Depends(get_db),
):
    token = request.cookies.get(settings.SESSION_COOKIE_NAME, "")
    user = get_user_by_session_token(db, token)

    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user

def require_role(required_role: str):
    def _checker(user = Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _checker
