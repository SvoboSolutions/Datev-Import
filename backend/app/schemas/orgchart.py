from pydantic import BaseModel, ConfigDict


class OrgchartPerson(BaseModel):
    employee_id: int
    external_id: str
    first_name: str
    last_name: str

    profession_type: str | None = None
    org_role: str | None = None
    is_executive: bool = False

    email: str | None = None
    phone: str | None = None
    employment_type: str | None = None
    weekly_hours: float | None = None

    model_config = ConfigDict(from_attributes=True)


class OrgchartLocationGroup(BaseModel):
    location_id: int
    location_name: str
    site_leads: list[OrgchartPerson]
    doctors: list[OrgchartPerson]
    mfas: list[OrgchartPerson]
    administration: list[OrgchartPerson]


class OrgchartResponse(BaseModel):
    executives: list[OrgchartPerson]
    locations: list[OrgchartLocationGroup]