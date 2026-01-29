import type { PayrollRow } from "../../api/employees";
import { formatEuro } from "../../utils/format";

function euro(v: number) {
  return formatEuro(v ?? 0);
}

function pct(v: number) {
  if (!Number.isFinite(v)) return "–";
  return `${v.toFixed(1)}%`;
}

function ratioPct(n: number, d: number) {
  if (!d) return "–";
  return pct((n / d) * 100);
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
}: {
  label: string;
  value: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-4">
      <div className="text-xs uppercase tracking-wide text-secondary">{label}</div>
      <div className="mt-1 text-xl font-semibold text-primary">{value}</div>
      {right ? <div className="mt-2">{right}</div> : null}
    </div>
  );
}

export function EmployeeStatsSection({ payroll }: { payroll: PayrollRow[] }) {
  const sorted = [...payroll].sort((a, b) => b.period.localeCompare(a.period));
  const cur = sorted[0];
  const prev = sorted[1];

  if (!cur) {
    return <div className="text-sm text-muted">Keine Payroll-Daten vorhanden.</div>;
  }

  const reimbCur =
    (cur.reimb_kk_amount ?? 0) + (cur.reimb_ba_amount ?? 0) + (cur.reimb_ifsg_amount ?? 0);

  const reimbPrev =
    (prev?.reimb_kk_amount ?? 0) + (prev?.reimb_ba_amount ?? 0) + (prev?.reimb_ifsg_amount ?? 0);

  const deltaCost = prev ? (cur.total_cost ?? 0) - (prev.total_cost ?? 0) : 0;
  const deltaGross = prev ? (cur.gross_amount ?? 0) - (prev.gross_amount ?? 0) : 0;
  const deltaReimb = prev ? reimbCur - reimbPrev : 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gesamtkosten"
          value={euro(cur.total_cost ?? 0)}
          right={prev ? deltaBadge(deltaCost, prev.total_cost ?? 0) : undefined}
        />
        <StatCard
          label="Brutto"
          value={euro(cur.gross_amount ?? 0)}
          right={prev ? deltaBadge(deltaGross, prev.gross_amount ?? 0) : undefined}
        />
        <StatCard label="SV-AG" value={euro(cur.sv_ag_amount ?? 0)} />
        <StatCard
          label="Erstattungen gesamt"
          value={euro(reimbCur)}
          right={prev ? deltaBadge(deltaReimb, reimbPrev) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Erstattungsquote"
          value={ratioPct(reimbCur, cur.total_cost ?? 0)}
        />
        <StatCard
          label="Kosten / Brutto (Quote)"
          value={ratioPct(cur.total_cost ?? 0, cur.gross_amount ?? 0)}
        />
        <StatCard
          label="Netto / Brutto (Quote)"
          value={ratioPct(cur.net_amount ?? 0, cur.gross_amount ?? 0)}
        />
      </div>
    </div>
  );
}
