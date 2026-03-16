from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr


class LocationRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class EmployeeShortRead(BaseModel):
    id: int
    external_id: str
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class EmployeeProfileRead(BaseModel):
    id: int | None = None
    employee_id: int
    location_id: int | None = None
    manager_employee_id: int | None = None

    profession_type: str | None = None
    org_role: str | None = None
    is_executive: bool = False

    email: EmailStr | None = None
    phone: str | None = None
    entry_date: date | None = None

    employment_type: str | None = None
    weekly_hours: Decimal | None = None

    location: LocationRead | None = None
    manager: EmployeeShortRead | None = None

    model_config = ConfigDict(from_attributes=True)


class EmployeeProfileUpdate(BaseModel):
    location_id: int | None = None
    manager_employee_id: int | None = None

    profession_type: str | None = None
    org_role: str | None = None
    is_executive: bool = False

    email: EmailStr | None = None
    phone: str | None = None
    entry_date: date | None = None

    employment_type: str | None = None
    weekly_hours: Decimal | None = None