import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Rectangle,
} from "recharts";
import { money, periodLabel, toNumber } from "../../charts/formatters";

function pct(delta: number, prev: number) {
  if (!prev) return 0;
  return (delta / prev) * 100;
}

function MomTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: any;
  payload?: any[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const d = payload[0]?.payload as any;
  const delta = toNumber(d?.delta);
  const prev = toNumber(d?.prev_total_cost);
  const p = pct(delta, prev);

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <div className="text-sm font-semibold mb-2">{periodLabel(String(label))}</div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Δ Gesamtkosten</span>
          <span className="font-semibold text-primary">{money(delta)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Δ %</span>
          <span className="font-semibold text-primary">
            {Number.isFinite(p) ? `${p.toFixed(1)}%` : "–"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MomChangeChart({
  rows,
}: {
  rows: { period: string; total_cost: number }[];
}) {
  const data = [...rows]
    .map((r) => ({ period: r.period, total_cost: toNumber(r.total_cost) }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const series = data.map((r, i) => {
    const prev = i > 0 ? data[i - 1].total_cost : 0;
    const delta = i > 0 ? r.total_cost - prev : 0;
    return { period: r.period, delta, prev_total_cost: prev };
  });

  const maxAbs = series.reduce((m, r) => Math.max(m, Math.abs(toNumber(r.delta))), 0);
  const yMax = (maxAbs || 1) * 1.2;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis width={90} domain={[-yMax, yMax]} tickFormatter={(v) => money(v)} />
          <Tooltip content={<MomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(15,23,42,0.35)" />

          <Bar
            dataKey="delta"
            name="Δ Gesamtkosten"
            isAnimationActive={false}
            shape={(props: any) => {
              const fill = props?.payload?.delta >= 0 ? "#ef4444" : "#16a34a";
              return <Rectangle {...props} fill={fill} radius={[6, 6, 6, 6]} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
