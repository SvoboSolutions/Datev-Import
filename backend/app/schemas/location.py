from pydantic import BaseModel, ConfigDict


class LocationCreate(BaseModel):
    name: str


class LocationRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)