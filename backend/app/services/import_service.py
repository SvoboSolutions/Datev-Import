import re
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.models.import_job import ImportJob
from app.models.employee import Employee
from app.models.employee_cost import EmployeeCost

from app.services.csv_import.registry import CsvParserRegistry
from app.services.csv_import.datev_payroll_v1 import DatevPayrollV1Parser
from app.services.csv_import.base import ParsedCsv


class ImportService:
    def __init__(self):
        registry = CsvParserRegistry()
        registry.register(DatevPayrollV1Parser())
        self.registry = registry

    # ---------- PERIOD HELPERS ----------
    def _parse_period_token(self, token: str) -> str | None:
        if not token:
            return None

        s = token.strip()

        m = re.match(r"^\s*(\d{4})-(\d{2})\s*$", s)
        if m:
            return f"{m.group(1)}-{m.group(2)}"

        m = re.match(r"^\s*(\d{1,2})\.(\d{4})\s*$", s)
        if m:
            month = int(m.group(1))
            year = int(m.group(2))
            if 1 <= month <= 12:
                return f"{year:04d}-{month:02d}"

        token = s.lower()
        MONTHS = {
            "jan": "01", "feb": "02", "mär": "03", "mae": "03", "mar": "03",
            "apr": "04", "mai": "05", "jun": "06", "jul": "07", "aug": "08",
            "sep": "09", "okt": "10", "nov": "11", "dez": "12",
        }

        parts = token.split()
        if len(parts) != 2:
            return None

        month_key = parts[0][:3]
        year_part = parts[1]

        if month_key in MONTHS:
            if year_part.isdigit() and len(year_part) == 2:
                return f"20{year_part}-{MONTHS[month_key]}"
            if year_part.isdigit() and len(year_part) == 4:
                return f"{year_part}-{MONTHS[month_key]}"

        return None

    def _extract_period_from_first_line(self, line: str) -> str | None:
        parts = line.split(";")
        if len(parts) >= 4:
            return self._parse_period_token(parts[3])
        return None

    # ---------- CSV LOADING ----------
    def load_csv(self, file_path: str) -> tuple[pd.DataFrame, str | None]:
        with open(file_path, encoding="latin1", errors="replace") as f:
            first_line = f.readline()

        period = self._extract_period_from_first_line(first_line)

        df = pd.read_csv(
            file_path,
            sep=";",
            encoding="latin1",
            header=1,
            engine="python",
            dtype=str,
        )

        # Summen / Müll entfernen
        if "Pers.-Nr." in df.columns:
            pid = df["Pers.-Nr."].astype(str).str.strip()
            df = df[~pid.str.lower().str.startswith("summen")]

        return df, period

    # ---------- PARSING ----------
    def detect_and_parse(self, file_path: str) -> tuple[ParsedCsv, dict]:
        df, period = self.load_csv(file_path)

        if not period:
            raise ValueError("Period not found in first line (expected e.g. 'Jan 26' / '01.2026')")

        detection = self.registry.detect_best(df)
        parser = self.registry.get_by_source_type(detection.chosen.source_type)

        parsed = parser.parse(df)
        parsed.period = period

        for r in parsed.rows:
            r["period"] = parsed.period

        debug = {"chosen": detection.chosen, "period": parsed.period}
        return parsed, debug

    # ---------- DB HELPERS ----------
    def _get_or_create_employee(self, db: Session, external_id: str, first_name: str, last_name: str) -> Employee:
        emp = db.execute(select(Employee).where(Employee.external_id == external_id)).scalar_one_or_none()
        if emp:
            emp.first_name = first_name
            emp.last_name = last_name
            return emp

        emp = Employee(external_id=external_id, first_name=first_name, last_name=last_name)
        db.add(emp)
        db.flush()
        return emp

    def _create_import_job(self, db: Session, source_type: str, period: str, filename: str) -> ImportJob:
        job = ImportJob(
            source_type=source_type,
            period=period,
            original_filename=filename,
            status="processing",
        )
        db.add(job)
        db.flush()
        return job

    def _delete_existing_period_data(self, db: Session, source_type: str, period: str) -> None:
        old_ids = db.execute(
            select(ImportJob.id).where(ImportJob.source_type == source_type, ImportJob.period == period)
        ).scalars().all()

        if not old_ids:
            return

        db.execute(delete(EmployeeCost).where(EmployeeCost.import_id.in_(old_ids)))
        db.execute(delete(ImportJob).where(ImportJob.id.in_(old_ids)))

    # ---------- PERSISTENZ ----------
    def persist_parsed_csv(self, db: Session, parsed: ParsedCsv, filename: str) -> ImportJob:
        self._delete_existing_period_data(db, parsed.source_type, parsed.period)

        job = self._create_import_job(db, parsed.source_type, parsed.period, filename)

        try:
            for row in parsed.rows:
                emp = self._get_or_create_employee(
                    db=db,
                    external_id=row["external_employee_id"],
                    first_name=row["first_name"],
                    last_name=row["last_name"],
                )

                db.add(EmployeeCost(
                    import_id=job.id,
                    employee_id=emp.id,
                    period=row["period"],
                    gross_amount=row["gross_amount"],
                    ag_bav_amount=row["ag_bav_amount"],
                    subsidy_amount=row["subsidy_amount"],
                    net_amount=row["net_amount"],
                    sv_ag_amount=row["sv_ag_amount"],
                    umlage_amount=row["umlage_amount"],
                    reimb_kk_amount=row["reimb_kk_amount"],
                    flat_tax_amount=row["flat_tax_amount"],
                    reimb_ba_amount=row["reimb_ba_amount"],
                    reimb_ifsg_amount=row["reimb_ifsg_amount"],
                    total_cost_wo_reimb=row["total_cost_wo_reimb"],
                    total_cost=row["total_cost"],
                    currency=row.get("currency", "EUR"),
                ))

            job.status = "ok"
            db.commit()
            return job

        except Exception as e:
            db.rollback()
            job.status = "error"
            job.error_message = str(e)
            db.commit()
            raise

    # ---------- ORCHESTRATOR ----------
    def import_csv_file(self, db: Session, file_path: str, original_filename: str) -> ImportJob:
        parsed, _ = self.detect_and_parse(file_path)
        return self.persist_parsed_csv(db=db, parsed=parsed, filename=original_filename)
