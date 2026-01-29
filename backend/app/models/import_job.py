from datetime import datetime

from sqlalchemy import String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class ImportJob(Base):
    __tablename__ = "imports"
    __table_args__ = (
        # pro CSV-Typ und Monat genau 1 Import (neuer Upload überschreibt)
        UniqueConstraint("source_type", "period", name="uq_imports_source_period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    source_type: Mapped[str] = mapped_column(String(100), index=True)
    period: Mapped[str] = mapped_column(String(7), index=True)  # YYYY-MM

    original_filename: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # optional: falls du mal mehrere Währungen/Imports willst
    currency: Mapped[str] = mapped_column(String(3), default="EUR")

    costs = relationship(
        "EmployeeCost",
        back_populates="import_job",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
