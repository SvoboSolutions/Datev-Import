import { useMemo, useState } from "react";
import type { PayrollRow } from "../../api/employees";
import { formatEuro } from "../../utils/format";

function euro(v: number) {
  return formatEuro(v ?? 0);
}

function pct(v: number) {
  if (!Number.isFinite(v)) return "–";
  return `${v.toFixed(1)}%`;
}

function deltaBadge(delta: number, base: number) {
  const sign = delta >= 0 ? "+" : "–";
  const abs = Math.abs(delta);
  const p = base ? (delta / base) * 100 : 0;

  const cls =
    delta > 0
      ? "text-red-700 bg-red-50 border-red-200"
      : delta < 0
      ? "text-green-700 bg-green-50 border-green-200"
      : "text-secondary bg-bg border-border";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      <span>{sign}</span>
      <span>{euro(abs)}</span>
      <span className="opacity-70">({pct(Math.abs(p))})</span>
    </span>
  );
}

function StatCard({
  label,
  value,
  right,
  children,
}: {
  label: string;
  value: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-secondary">{label}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-1 text-xl font-semibold text-primary">{value}</div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function getYearFromPeriod(period: string): number | null {
  const match = /^(\d{4})-(\d{1,2})$/.exec(period);
  if (!match) return null;
  return Number(match[1]);
}

type RangeOption = "total" | "last12" | "currentYear" | `year:${number}`;

export function EmployeeStatsSection({ payroll }: { payroll: PayrollRow[] }) {
  const sorted = useMemo(
    () => [...payroll].sort((a, b) => b.period.localeCompare(a.period)),
    [payroll]
  );

  const cur = sorted[0];
  const prev = sorted[1];

  if (!cur) {
    return <div className="text-sm text-muted">Keine Payroll-Daten vorhanden.</div>;
  }

  const availableYears = Array.from(
    new Set(
      sorted
        .map((row) => getYearFromPeriod(row.period))
        .filter((year): year is number => year != null)
    )
  ).sort((a, b) => b - a);

  const newestYear = availableYears[0] ?? null;

  const [selectedRange, setSelectedRange] = useState<RangeOption>("currentYear");

  const currentYearRows =
    newestYear == null
      ? []
      : sorted.filter((row) => getYearFromPeriod(row.period) === newestYear);

  const rolling12Rows = sorted.slice(0, 12);

  const currentYearTotalCost = currentYearRows.reduce(
    (sum, row) => sum + (row.total_cost ?? 0),
    0
  );

  const rolling12TotalCost = rolling12Rows.reduce(
    (sum, row) => sum + (row.total_cost ?? 0),
    0
  );

  const totalCostAll = sorted.reduce((sum, row) => sum + (row.total_cost ?? 0), 0);

  const rangeLabel = (() => {
    if (selectedRange === "total") return "Gesamtkosten gesamt";
    if (selectedRange === "last12") return "Gesamtkosten letzte 12 Monate";
    if (selectedRange === "currentYear") {
      return `Gesamtkosten ${newestYear ?? "aktuelles Jahr"}`;
    }
    if (selectedRange.startsWith("year:")) {
      return `Gesamtkosten ${selectedRange.replace("year:", "")}`;
    }
    return "Gesamtkosten";
  })();

  const rangeValue = (() => {
    if (selectedRange === "total") return totalCostAll;
    if (selectedRange === "last12") return rolling12TotalCost;
    if (selectedRange === "currentYear") return currentYearTotalCost;
    if (selectedRange.startsWith("year:")) {
      const year = Number(selectedRange.replace("year:", ""));
      return sorted
        .filter((row) => getYearFromPeriod(row.period) === year)
        .reduce((sum, row) => sum + (row.total_cost ?? 0), 0);
    }
    return 0;
  })();

  const deltaCost = prev ? (cur.total_cost ?? 0) - (prev.total_cost ?? 0) : 0;

  return (
    <div className="space-y-4">
      <div className="text-sm text-secondary">
        Aktueller Monat: <span className="font-medium text-primary">{cur.period}</span>
        {prev ? (
          <>
            {" "}
            · Vergleich zu <span className="font-medium text-primary">{prev.period}</span>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Gesamtkosten aktueller Monat"
          value={euro(cur.total_cost ?? 0)}
          right={prev ? deltaBadge(deltaCost, prev.total_cost ?? 0) : undefined}
        />

        <StatCard
          label="Gesamtkosten Vormonat"
          value={euro(prev?.total_cost ?? 0)}
        />

        <StatCard label={rangeLabel} value={euro(rangeValue)}>
          <label className="block">
            <span className="mb-1 block text-xs text-secondary">Zeitraum</span>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as RangeOption)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition focus:border-accent"
            >
              {newestYear != null ? (
                <option value="currentYear">Aktuelles Jahr ({newestYear})</option>
              ) : null}
              <option value="last12">Letzte 12 Monate</option>
              <option value="total">Gesamt</option>
              {availableYears.map((year) => (
                <option key={year} value={`year:${year}`}>
                  Jahr {year}
                </option>
              ))}
            </select>
          </label>
        </StatCard>
      </div>
    </div>
  );
}