from dataclasses import dataclass
from typing import Protocol, Any
import pandas as pd


@dataclass(frozen=True)
class DetectedCsv:
    source_type: str
    score: float
    details: dict[str, Any]


@dataclass
class ParsedCsv:
    source_type: str
    period: str
    meta: dict[str, Any]
    rows: list[dict[str, Any]]


class CsvParser(Protocol):
    source_type: str

    def detect(self, df: pd.DataFrame) -> DetectedCsv: ...
    def parse(self, df: pd.DataFrame) -> ParsedCsv: ...
