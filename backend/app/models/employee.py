from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Pers.-Nr. aus CSV
    external_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))

    # Historie der Payroll-Zeilen
    costs = relationship(
        "EmployeeCost",
        back_populates="employee",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # Manuell pflegbare Stammdaten / Organigramm
    profile = relationship(
        "EmployeeProfile",
        foreign_keys="EmployeeProfile.employee_id",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # Mitarbeitende, die an diese Person berichten
    direct_reports = relationship(
        "EmployeeProfile",
        foreign_keys="EmployeeProfile.manager_employee_id",
        back_populates="manager",
    )