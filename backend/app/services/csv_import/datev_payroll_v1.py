import pandas as pd
from typing import Any

from app.services.csv_import.base import DetectedCsv, ParsedCsv


def _parse_amount(value) -> float:
    if value is None:
        return 0.0
    s = str(value).strip()
    if s == "" or s.lower() == "nan":
        return 0.0
    s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def _norm(s: str) -> str:
    s = (s or "").strip().lower()
    s = s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    # Trennzeichen vereinheitlichen
    s = s.replace("/", " ").replace("-", " ")
    return " ".join(s.split())


class DatevPayrollV1Parser:
    source_type = "datev_payroll_v1"

    def detect(self, df: pd.DataFrame) -> DetectedCsv:
        required = {"Pers.-Nr.", "Nachname", "Vorname"}
        score = 1.0 if required.issubset(df.columns) else 0.0
        return DetectedCsv(
            source_type=self.source_type,
            score=score,
            details={"columns": list(df.columns)},
        )

    def parse(self, df: pd.DataFrame) -> ParsedCsv:
        # Reihenfolge wichtig: "Gesamtkosten ohne" vor "Gesamtkosten"
        field_needles = [
            ("gesamtbrutto", "gross_amount"),
            ("ag anteil bav", "ag_bav_amount"),
            ("foerderbetrag", "subsidy_amount"),
            ("förderbetrag", "subsidy_amount"),
            ("nettobezuege nettoabzuege", "net_amount"),
            ("nettobezuege", "net_amount"),
            ("sv ag anteil", "sv_ag_amount"),
            ("sv ag", "sv_ag_amount"),
            ("umlage", "umlage_amount"),
            ("erstattung kk", "reimb_kk_amount"),
            ("pauschale steuern", "flat_tax_amount"),
            ("erstattung ba", "reimb_ba_amount"),
            ("ifsg", "reimb_ifsg_amount"),
            ("gesamtkosten ohne erstattung", "total_cost_wo_reimb"),
            ("gesamtkosten ohne", "total_cost_wo_reimb"),
            ("gesamtkosten", "total_cost"),
        ]

        norm_cols = {c: _norm(c) for c in df.columns}

        def find_col(needle: str) -> str | None:
            n = _norm(needle)
            for col, ncol in norm_cols.items():
                if n in ncol:
                    return col
            return None

        col_for_key: dict[str, str | None] = {}
        for needle, key in field_needles:
            if key not in col_for_key:
                col_for_key[key] = find_col(needle)

        rows: list[dict[str, Any]] = []

        for _, r in df.iterrows():
            pid = str(r.get("Pers.-Nr.", "")).strip()
            if not pid.isdigit():
                continue

            def get_amount(key: str) -> float:
                col = col_for_key.get(key)
                return _parse_amount(r.get(col)) if col else 0.0

            rows.append(
                {
                    "external_employee_id": pid,
                    "first_name": str(r.get("Vorname", "")).strip(),
                    "last_name": str(r.get("Nachname", "")).strip(),
                    "period": "unknown",
                    "currency": "EUR",
                    "gross_amount": get_amount("gross_amount"),
                    "ag_bav_amount": get_amount("ag_bav_amount"),
                    "subsidy_amount": get_amount("subsidy_amount"),
                    "net_amount": get_amount("net_amount"),
                    "sv_ag_amount": get_amount("sv_ag_amount"),
                    "umlage_amount": get_amount("umlage_amount"),
                    "reimb_kk_amount": get_amount("reimb_kk_amount"),
                    "flat_tax_amount": get_amount("flat_tax_amount"),
                    "reimb_ba_amount": get_amount("reimb_ba_amount"),
                    "reimb_ifsg_amount": get_amount("reimb_ifsg_amount"),
                    "total_cost_wo_reimb": get_amount("total_cost_wo_reimb"),
                    "total_cost": get_amount("total_cost"),
                }
            )

        return ParsedCsv(
            source_type=self.source_type,
            period="unknown",
            meta={"row_count": len(rows), "columns_used": col_for_key},
            rows=rows,
        )
