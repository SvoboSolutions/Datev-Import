from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession, joinedload

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.employee_profile import EmployeeProfile
from app.models.location import Location

router = APIRouter()


def to_person(profile: EmployeeProfile) -> dict:
    employee = profile.employee
    return {
        "employee_id": employee.id,
        "external_id": employee.external_id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "profession_type": profile.profession_type,
        "org_role": profile.org_role,
        "is_executive": profile.is_executive,
        "email": profile.email,
        "phone": profile.phone,
        "employment_type": profile.employment_type,
        "weekly_hours": float(profile.weekly_hours) if profile.weekly_hours is not None else None,
    }


@router.get("")
def get_orgchart(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    profiles = db.execute(
        select(EmployeeProfile).options(
            joinedload(EmployeeProfile.employee),
            joinedload(EmployeeProfile.location),
        )
    ).scalars().all()

    # Nur noch is_executive entscheidet über Geschäftsführung.
    executives = [
        to_person(profile)
        for profile in profiles
        if profile.is_executive
    ]

    locations = db.execute(select(Location).order_by(Location.name)).scalars().all()

    location_groups: list[dict] = []
    for location in locations:
        loc_profiles = [p for p in profiles if p.location_id == location.id]

        # Standortleitungen, die NICHT gleichzeitig in der Geschäftsführung
        # angezeigt werden sollen, bleiben hier.
        site_leads = [
            to_person(p)
            for p in loc_profiles
            if p.org_role == "site_lead" and not p.is_executive
        ]

        grouped_profiles = [
            p for p in loc_profiles
            if not p.is_executive and p.org_role != "site_lead"
        ]

        doctors = [to_person(p) for p in grouped_profiles if p.profession_type == "Arzt"]
        mfas = [to_person(p) for p in grouped_profiles if p.profession_type == "MFA"]
        administration = [
            to_person(p)
            for p in grouped_profiles
            if p.profession_type == "Verwaltung"
        ]

        location_groups.append(
            {
                "location_id": location.id,
                "location_name": location.name,
                "site_leads": sorted(site_leads, key=lambda x: (x["last_name"], x["first_name"])),
                "doctors": sorted(doctors, key=lambda x: (x["last_name"], x["first_name"])),
                "mfas": sorted(mfas, key=lambda x: (x["last_name"], x["first_name"])),
                "administration": sorted(
                    administration,
                    key=lambda x: (x["last_name"], x["first_name"]),
                ),
            }
        )

    executives = sorted(executives, key=lambda x: (x["last_name"], x["first_name"]))

    return {
        "executives": executives,
        "locations": location_groups,
    }