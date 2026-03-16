from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    manager_employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    profession_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # none | site_lead
    org_role: Mapped[str] = mapped_column(String(50), default="none")

    # zusätzliche Führungsrolle
    is_executive: Mapped[bool] = mapped_column(Boolean, default=False)

    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    entry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    weekly_hours: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    employee = relationship(
        "Employee",
        foreign_keys=[employee_id],
        back_populates="profile",
    )

    manager = relationship(
        "Employee",
        foreign_keys=[manager_employee_id],
        back_populates="direct_reports",
    )

    location = relationship("Location", back_populates="profiles")