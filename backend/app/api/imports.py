from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, UploadFile, HTTPException, File
from sqlalchemy.orm import Session as DbSession
from sqlalchemy import select, desc, func, delete

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.import_job import ImportJob
from app.models.employee_cost import EmployeeCost
from app.services.import_service import ImportService

router = APIRouter()


def _validate_csv_files(files: list[UploadFile]) -> None:
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    invalid = [
        f.filename or "<unknown>"
        for f in files
        if not (f.filename and f.filename.lower().endswith(".csv"))
    ]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Only CSV files are allowed. Invalid: {', '.join(invalid)}",
        )


@router.post("")
def upload_imports(
    files: list[UploadFile] = File(...),
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
    _validate_csv_files(files)

    svc = ImportService()
    results: list[dict] = []

    for file in files:
        original_filename = file.filename or "upload.csv"
        tmp_name = f"{uuid4().hex}_{Path(original_filename).name}"
        tmp_path = Path("/tmp") / tmp_name

        try:
            contents = file.file.read()
            tmp_path.write_bytes(contents)

            job = svc.import_csv_file(
                db=db,
                file_path=str(tmp_path),
                original_filename=original_filename,
            )

            results.append(
                {
                    "id": job.id,
                    "status": job.status,
                    "period": job.period,
                    "filename": job.original_filename,
                    "source_type": job.source_type,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                }
            )
        finally:
            try:
                if tmp_path.exists():
                    tmp_path.unlink()
            except OSError:
                pass
            file.file.close()

    return {
        "count": len(results),
        "items": results,
    }


@router.get("")
def list_imports(
    db: DbSession = Depends(get_db),
    user=Depends(get_current_user),
):
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
    job = db.execute(select(ImportJob).where(ImportJob.id == import_id)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Import not found")

    db.execute(delete(EmployeeCost).where(EmployeeCost.import_id == import_id))
    db.execute(delete(ImportJob).where(ImportJob.id == import_id))
    db.commit()

    return {"status": "ok", "deleted_id": import_id}