import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { money, periodLabel } from "../../charts/formatters";

type Item = {
  last_name: string;
  first_name: string;
  external_id: string; // Pers.-Nr.
  total_cost: number;
};

function TopEmployeesTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null;

  const d = payload[0]?.payload as any;
  const ext = d?.external_id ?? "";
  const name = `${d?.last_name ?? ""}, ${d?.first_name ?? ""}`.trim().replace(/^, /, "");
  const value = d?.total_cost ?? 0;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <div className="text-sm font-semibold text-primary mb-1">Pers.-Nr.: {ext}</div>
      <div className="text-xs text-secondary mb-2">{name || "–"}</div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-secondary">Gesamtkosten</span>
        <span className="font-semibold text-primary">{money(value)}</span>
      </div>
    </div>
  );
}

export function TopEmployeesChart({
  items,
  period,
}: {
  items: Item[];
  period?: string | null;
}) {
  // höchster zuerst
  const data = [...items]
    .sort((a, b) => b.total_cost - a.total_cost)
    .map((e) => ({
      external_id: e.external_id,
      first_name: e.first_name,
      last_name: e.last_name,
      total_cost: e.total_cost,
    }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />

          {/* X = Pers.-Nr. */}
          <XAxis
            dataKey="external_id"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={0}
          />

          {/* Y = Kosten */}
          <YAxis width={90} tickFormatter={(v) => money(v)} />

          <Tooltip content={<TopEmployeesTooltip />} />

          {/* Rot */}
          <Bar
            dataKey="total_cost"
            name="Gesamtkosten"
            fill="#fca5a5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {period ? (
        <div className="mt-2 text-xs text-muted text-right">
          Top 5 in {periodLabel(period)}
        </div>
      ) : null}
    </div>
  );
}
