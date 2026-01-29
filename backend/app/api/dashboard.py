from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import func, select, desc

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.employee_cost import EmployeeCost
from app.models.import_job import ImportJob
from app.models.employee import Employee

router = APIRouter()


def _latest_period(db: DbSession) -> str | None:
    return db.execute(select(func.max(EmployeeCost.period))).scalar_one_or_none()


@router.get("/periods")
def dashboard_periods(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    rows = db.execute(
        select(EmployeeCost.period).distinct().order_by(EmployeeCost.period.desc())
    ).all()
    return [r[0] for r in rows]


@router.get("/kpis")
def dashboard_kpis(
    period: str | None = None,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    if not period:
        period = _latest_period(db)

    q = select(
        func.count(func.distinct(EmployeeCost.employee_id)).label("employee_count"),
        func.coalesce(func.sum(EmployeeCost.total_cost), 0).label("total_cost"),
        func.coalesce(func.sum(EmployeeCost.gross_amount), 0).label("total_gross"),
        func.coalesce(func.sum(EmployeeCost.sv_ag_amount), 0).label("total_sv_ag"),
        func.coalesce(func.sum(EmployeeCost.reimb_kk_amount), 0).label("total_reimb_kk"),
        func.coalesce(func.sum(EmployeeCost.reimb_ba_amount), 0).label("total_reimb_ba"),
        func.coalesce(func.sum(EmployeeCost.reimb_ifsg_amount), 0).label("total_reimb_ifsg"),
    )

    if period:
        q = q.where(EmployeeCost.period == period)

    result = db.execute(q).one()

    last_job = (
        db.execute(select(ImportJob).order_by(ImportJob.id.desc()).limit(1))
        .scalars()
        .first()
    )

    return {
        "period": period,
        "employee_count": int(result.employee_count),
        "total_cost": float(result.total_cost),
        "total_gross": float(result.total_gross),
        "total_sv_ag": float(result.total_sv_ag),
        "total_reimb_kk": float(result.total_reimb_kk),
        "total_reimb_ba": float(result.total_reimb_ba),
        "total_reimb_ifsg": float(result.total_reimb_ifsg),
        "last_import_status": last_job.status if last_job else None,
    }


@router.get("/monthly-costs")
def dashboard_monthly_costs(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    stmt = (
        select(
            EmployeeCost.period,
            func.count(func.distinct(EmployeeCost.employee_id)).label("employee_count"),
            func.coalesce(func.sum(EmployeeCost.total_cost), 0).label("total_cost"),
            func.coalesce(func.sum(EmployeeCost.gross_amount), 0).label("gross"),
            func.coalesce(func.sum(EmployeeCost.sv_ag_amount), 0).label("sv_ag"),
            func.coalesce(func.sum(EmployeeCost.umlage_amount), 0).label("umlage"),
            func.coalesce(func.sum(EmployeeCost.ag_bav_amount), 0).label("ag_bav"),
            func.coalesce(func.sum(EmployeeCost.flat_tax_amount), 0).label("flat_tax"),
            func.coalesce(func.sum(EmployeeCost.reimb_kk_amount), 0).label("reimb_kk"),
            func.coalesce(func.sum(EmployeeCost.reimb_ba_amount), 0).label("reimb_ba"),
            func.coalesce(func.sum(EmployeeCost.reimb_ifsg_amount), 0).label("reimb_ifsg"),
        )
        .group_by(EmployeeCost.period)
        .order_by(EmployeeCost.period)
    )

    rows = db.execute(stmt).all()

    return [
        {
            "period": r.period,
            "employee_count": int(r.employee_count),
            "total_cost": float(r.total_cost),
            "gross": float(r.gross),
            "sv_ag": float(r.sv_ag),
            "umlage": float(r.umlage),
            "ag_bav": float(r.ag_bav),
            "flat_tax": float(r.flat_tax),
            "reimb_kk": float(r.reimb_kk),
            "reimb_ba": float(r.reimb_ba),
            "reimb_ifsg": float(r.reimb_ifsg),
        }
        for r in rows
    ]



@router.get("/top-employees")
def dashboard_top_employees(
    period: str | None = None,
    limit: int = 10,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    if not period:
        period = _latest_period(db)

    if not period:
        return {"period": None, "items": []}

    stmt = (
        select(
            Employee.id.label("employee_id"),
            Employee.external_id,
            Employee.first_name,
            Employee.last_name,
            func.coalesce(func.sum(EmployeeCost.total_cost), 0).label("total_cost"),
        )
        .join(Employee, Employee.id == EmployeeCost.employee_id)
        .where(EmployeeCost.period == period)
        .group_by(Employee.id, Employee.external_id, Employee.first_name, Employee.last_name)
        .order_by(desc("total_cost"))
        .limit(limit)
    )

    rows = db.execute(stmt).all()

    return {
        "period": period,
        "items": [
            {
                "employee_id": r.employee_id,
                "external_id": r.external_id,
                "first_name": r.first_name,
                "last_name": r.last_name,
                "total_cost": float(r.total_cost),
            }
            for r in rows
        ],
    }

@router.get("/hotspots")
def dashboard_hotspots(
    limit: int = 5,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Liefert pro Periode die Top-N Mitarbeiter nach Gesamtkosten.
    Format:
    [
      { "period": "2026-01", "items": [ ...top employees... ] },
      ...
    ]
    """
    # Alle Perioden (desc: neueste zuerst)
    periods = db.execute(
        select(EmployeeCost.period).distinct().order_by(EmployeeCost.period.desc())
    ).scalars().all()

    out = []
    for p in periods:
        stmt = (
            select(
                Employee.external_id,
                Employee.first_name,
                Employee.last_name,
                func.coalesce(func.sum(EmployeeCost.total_cost), 0).label("total_cost"),
            )
            .join(Employee, Employee.id == EmployeeCost.employee_id)
            .where(EmployeeCost.period == p)
            .group_by(Employee.external_id, Employee.first_name, Employee.last_name)
            .order_by(desc("total_cost"))
            .limit(limit)
        )
        rows = db.execute(stmt).all()

        out.append({
            "period": p,
            "items": [
                {
                    "external_id": r.external_id,
                    "first_name": r.first_name,
                    "last_name": r.last_name,
                    "total_cost": float(r.total_cost),
                }
                for r in rows
            ],
        })

    return out

