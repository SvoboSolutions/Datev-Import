from fastapi import APIRouter, Depends, UploadFile, HTTPException
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select, desc

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.import_job import ImportJob
from app.services.import_service import ImportService

router = APIRouter()


@router.post("")
def upload_import(
    file: UploadFile,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    svc = ImportService()

    contents = file.file.read()
    tmp_path = f"/tmp/{file.filename}"

    with open(tmp_path, "wb") as f:
        f.write(contents)

    job = svc.import_csv_file(db=db, file_path=tmp_path, original_filename=file.filename)

    return {
        "id": job.id,
        "status": job.status,
        "period": job.period,
        "filename": job.original_filename,
    }


@router.get("")
def list_imports(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    stmt = select(ImportJob).order_by(desc(ImportJob.id)).limit(50)
    jobs = db.execute(stmt).scalars().all()

    return [
        {
            "id": j.id,
            "filename": j.original_filename,
            "period": j.period,
            "status": j.status,
        }
        for j in jobs
    ]
