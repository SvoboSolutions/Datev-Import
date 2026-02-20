from fastapi import APIRouter, Depends, UploadFile, HTTPException, Request
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select, desc, func, delete

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.import_job import ImportJob
from app.models.employee_cost import EmployeeCost
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

    # WICHTIG: ImportService erwartet db jetzt (wie bei dir umgebaut)
    job = svc.import_csv_file(db=db, file_path=tmp_path, original_filename=file.filename)

    return {
        "id": job.id,
        "status": job.status,
        "period": job.period,
        "filename": job.original_filename,
        "source_type": job.source_type,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@router.get("")
def list_imports(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Payroll-Datensätze (Imports) inkl. row_count (Anzahl EmployeeCost-Zeilen)
    """
    stmt = (
        select(
            ImportJob.id,
            ImportJob.original_filename,
            ImportJob.period,
            ImportJob.source_type,
            ImportJob.status,
            ImportJob.created_at,
            func.count(EmployeeCost.id).label("row_count"),
        )
        .outerjoin(EmployeeCost, EmployeeCost.import_id == ImportJob.id)
        .group_by(
            ImportJob.id,
            ImportJob.original_filename,
            ImportJob.period,
            ImportJob.source_type,
            ImportJob.status,
            ImportJob.created_at,
        )
        .order_by(desc(ImportJob.id))
        .limit(100)
    )

    rows = db.execute(stmt).all()

    return [
        {
            "id": r.id,
            "filename": r.original_filename,
            "period": r.period,
            "source_type": r.source_type,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "row_count": int(r.row_count or 0),
        }
        for r in rows
    ]


@router.delete("/{import_id}")
def delete_import(
    import_id: int,
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Löscht einen kompletten Payroll-Datensatz:
    - EmployeeCost-Zeilen
    - ImportJob
    Robust auch ohne FK-CASCADE (SQLite-PRAGMA).
    """
    job = db.execute(select(ImportJob).where(ImportJob.id == import_id)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Import not found")

    # 1) Kosten löschen
    db.execute(delete(EmployeeCost).where(EmployeeCost.import_id == import_id))
    # 2) Import löschen
    db.execute(delete(ImportJob).where(ImportJob.id == import_id))
    db.commit()

    return {"status": "ok", "deleted_id": import_id}