from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select
from sqlalchemy import select, func, or_

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.employee import Employee
from app.models.employee_cost import EmployeeCost

router = APIRouter()




@router.get("")
def list_employees(
    q: str | None = None,
    page: int = 1,
    page_size: int = 25,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    page = max(page, 1)
    page_size = min(max(page_size, 5), 100)

    stmt = select(Employee)
    count_stmt = select(func.count()).select_from(Employee)

    if q:
        s = f"%{q.strip()}%"
        cond = or_(
            Employee.first_name.ilike(s),
            Employee.last_name.ilike(s),
            Employee.external_id.ilike(s),
        )
        stmt = stmt.where(cond)
        count_stmt = count_stmt.where(cond)

    total = db.execute(count_stmt).scalar_one()
    stmt = (
        stmt.order_by(Employee.last_name, Employee.first_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    rows = db.execute(stmt).scalars().all()

    return {
        "items": [
            {
                "id": e.id,
                "external_id": e.external_id,
                "first_name": e.first_name,
                "last_name": e.last_name,
            }
            for e in rows
        ],
        "page": page,
        "page_size": page_size,
        "total": int(total),
    }



@router.get("/{employee_id}/payroll")
def employee_payroll_history(
    employee_id: int,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    emp = db.execute(select(Employee).where(Employee.id == employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    costs = (
        db.execute(
            select(EmployeeCost)
            .where(EmployeeCost.employee_id == employee_id)
            .order_by(EmployeeCost.period.desc())
        )
        .scalars()
        .all()
    )

    def f(v) -> float:
        return float(v or 0)

    return {
        "employee": {
            "id": emp.id,
            "external_id": emp.external_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
        },
        "payroll": [
            {
                "period": c.period,
                "currency": c.currency,

                "gross_amount": f(c.gross_amount),
                "sv_ag_amount": f(c.sv_ag_amount),
                "ag_bav_amount": f(c.ag_bav_amount),
                "subsidy_amount": f(c.subsidy_amount),
                "net_amount": f(c.net_amount),
                "umlage_amount": f(c.umlage_amount),

                "reimb_kk_amount": f(c.reimb_kk_amount),
                "flat_tax_amount": f(c.flat_tax_amount),
                "reimb_ba_amount": f(c.reimb_ba_amount),
                "reimb_ifsg_amount": f(c.reimb_ifsg_amount),

                "total_cost_wo_reimb": f(c.total_cost_wo_reimb),
                "total_cost": f(c.total_cost),
            }
            for c in costs
        ],
    }
