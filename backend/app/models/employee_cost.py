from sqlalchemy import String, ForeignKey, Numeric, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class EmployeeCost(Base):
    __tablename__ = "employee_costs"
    __table_args__ = (
        Index("ix_employee_costs_employee_period", "employee_id", "period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    import_id: Mapped[int] = mapped_column(
        ForeignKey("imports.id", ondelete="CASCADE"), index=True
    )
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )

    period: Mapped[str] = mapped_column(String(7), index=True)  # YYYY-MM

    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2))                 # Gesamtbrutto
    ag_bav_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)     # AG-Anteil bAV
    subsidy_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)    # Förderbetrag
    net_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)        # Nettobezüge/Nettoabzüge
    sv_ag_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)      # SV-AG-Anteil
    umlage_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)     # Umlage

    reimb_kk_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)   # Erstattung KK
    flat_tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)   # Pauschale Steuern
    reimb_ba_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)   # Erstattung BA
    reimb_ifsg_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0) # Erstattungen IfSG

    total_cost_wo_reimb: Mapped[float] = mapped_column(Numeric(12, 2), default=0)  # GK ohne Erstattung
    total_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0)           # Gesamtkosten

    currency: Mapped[str] = mapped_column(String(3), default="EUR")

    employee = relationship("Employee", back_populates="costs")
    import_job = relationship("ImportJob", back_populates="costs")
