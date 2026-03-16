from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session as DbSession, joinedload

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.employee import Employee
from app.models.employee_cost import EmployeeCost
from app.models.employee_profile import EmployeeProfile
from app.models.location import Location
from app.schemas.employee_profile import EmployeeProfileUpdate
from app.schemas.location import LocationCreate

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


@router.get("/locations/all")
def list_locations(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    rows = db.execute(select(Location).order_by(Location.name)).scalars().all()
    return [{"id": loc.id, "name": loc.name} for loc in rows]


@router.post("/locations")
def create_location(
    payload: LocationCreate,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Location name is required")

    existing = db.execute(
        select(Location).where(func.lower(Location.name) == name.lower())
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Location already exists")

    location = Location(name=name)
    db.add(location)
    db.commit()
    db.refresh(location)

    return {
        "id": location.id,
        "name": location.name,
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


@router.get("/{employee_id}/profile")
def get_employee_profile(
    employee_id: int,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    emp = db.execute(select(Employee).where(Employee.id == employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    profile = db.execute(
        select(EmployeeProfile)
        .options(
            joinedload(EmployeeProfile.location),
            joinedload(EmployeeProfile.manager),
        )
        .where(EmployeeProfile.employee_id == employee_id)
    ).scalar_one_or_none()

    if profile is None:
        return {
            "id": None,
            "employee_id": emp.id,
            "location_id": None,
            "manager_employee_id": None,
            "profession_type": None,
            "org_role": "none",
            "is_executive": False,
            "email": None,
            "phone": None,
            "entry_date": None,
            "employment_type": None,
            "weekly_hours": None,
            "location": None,
            "manager": None,
        }

    return {
        "id": profile.id,
        "employee_id": profile.employee_id,
        "location_id": profile.location_id,
        "manager_employee_id": profile.manager_employee_id,
        "profession_type": profile.profession_type,
        "org_role": profile.org_role,
        "is_executive": profile.is_executive,
        "email": profile.email,
        "phone": profile.phone,
        "entry_date": profile.entry_date.isoformat() if profile.entry_date else None,
        "employment_type": profile.employment_type,
        "weekly_hours": float(profile.weekly_hours) if profile.weekly_hours is not None else None,
        "location": (
            {
                "id": profile.location.id,
                "name": profile.location.name,
            }
            if profile.location
            else None
        ),
        "manager": (
            {
                "id": profile.manager.id,
                "external_id": profile.manager.external_id,
                "first_name": profile.manager.first_name,
                "last_name": profile.manager.last_name,
            }
            if profile.manager
            else None
        ),
    }


@router.put("/{employee_id}/profile")
def upsert_employee_profile(
    employee_id: int,
    payload: EmployeeProfileUpdate,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    emp = db.execute(select(Employee).where(Employee.id == employee_id)).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if payload.location_id is not None:
        location = db.execute(
            select(Location).where(Location.id == payload.location_id)
        ).scalar_one_or_none()
        if location is None:
            raise HTTPException(status_code=400, detail="Location not found")

    if payload.manager_employee_id is not None:
        if payload.manager_employee_id == employee_id:
            raise HTTPException(status_code=400, detail="Employee cannot manage themselves")

        manager = db.execute(
            select(Employee).where(Employee.id == payload.manager_employee_id)
        ).scalar_one_or_none()
        if manager is None:
            raise HTTPException(status_code=400, detail="Manager not found")

    profile = db.execute(
        select(EmployeeProfile).where(EmployeeProfile.employee_id == employee_id)
    ).scalar_one_or_none()

    if profile is None:
        profile = EmployeeProfile(employee_id=employee_id)
        db.add(profile)

    normalized_org_role = payload.org_role or "none"

    # Altlasten aus alter Logik bereinigen:
    # "executive" soll nicht mehr als org_role gespeichert werden,
    # sondern nur noch über is_executive abgebildet sein.
    if normalized_org_role == "executive":
        normalized_org_role = "none"

    profile.location_id = payload.location_id
    profile.manager_employee_id = payload.manager_employee_id
    profile.profession_type = payload.profession_type
    profile.org_role = normalized_org_role
    profile.is_executive = payload.is_executive
    profile.email = payload.email
    profile.phone = payload.phone
    profile.entry_date = payload.entry_date
    profile.employment_type = payload.employment_type
    profile.weekly_hours = payload.weekly_hours

    db.commit()
    db.refresh(profile)

    profile = db.execute(
        select(EmployeeProfile)
        .options(
            joinedload(EmployeeProfile.location),
            joinedload(EmployeeProfile.manager),
        )
        .where(EmployeeProfile.employee_id == employee_id)
    ).scalar_one()

    return {
        "id": profile.id,
        "employee_id": profile.employee_id,
        "location_id": profile.location_id,
        "manager_employee_id": profile.manager_employee_id,
        "profession_type": profile.profession_type,
        "org_role": profile.org_role,
        "is_executive": profile.is_executive,
        "email": profile.email,
        "phone": profile.phone,
        "entry_date": profile.entry_date.isoformat() if profile.entry_date else None,
        "employment_type": profile.employment_type,
        "weekly_hours": float(profile.weekly_hours) if profile.weekly_hours is not None else None,
        "location": (
            {
                "id": profile.location.id,
                "name": profile.location.name,
            }
            if profile.location
            else None
        ),
        "manager": (
            {
                "id": profile.manager.id,
                "external_id": profile.manager.external_id,
                "first_name": profile.manager.first_name,
                "last_name": profile.manager.last_name,
            }
            if profile.manager
            else None
        ),
    }