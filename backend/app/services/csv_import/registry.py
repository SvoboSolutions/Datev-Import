from dataclasses import dataclass
import pandas as pd
from app.services.csv_import.base import CsvParser, DetectedCsv


@dataclass
class DetectionResult:
    chosen: DetectedCsv
    all_candidates: list[DetectedCsv]


class CsvParserRegistry:
    def __init__(self):
        self._parsers: list[CsvParser] = []

    def register(self, parser: CsvParser):
        self._parsers.append(parser)

    def detect_best(self, df: pd.DataFrame, min_score: float = 0.6) -> DetectionResult:
        candidates = [p.detect(df) for p in self._parsers]
        candidates.sort(key=lambda c: c.score, reverse=True)

        best = candidates[0]
        if best.score < min_score:
            raise ValueError("No suitable CSV parser found")

        return DetectionResult(best, candidates)

    def get_by_source_type(self, source_type: str) -> CsvParser:
        for p in self._parsers:
            if p.source_type == source_type:
                return p
        raise KeyError(source_type)
