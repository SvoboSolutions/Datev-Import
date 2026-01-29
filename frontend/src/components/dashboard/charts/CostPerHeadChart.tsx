import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { EuroTooltip } from "../../charts/EuroTooltip";
import { money, periodLabel, toNumber } from "../../charts/formatters";

export function CostPerHeadChart({
  rows,
}: {
  rows: { period: string; total_cost: number; employee_count: number }[];
}) {
  const data = [...rows]
    .map((r) => {
      const total = toNumber(r.total_cost);
      const cnt = Math.max(toNumber(r.employee_count), 0);
      const perHead = cnt > 0 ? total / cnt : 0;
      return { period: r.period, per_head: perHead };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  // optional: ein bisschen Headroom, damit die Linie nicht klebt (max bei ~60%)
  const maxVal = data.reduce((m, r) => Math.max(m, r.per_head), 0);
  const yMax = maxVal <= 0 ? 1 : Math.ceil(maxVal / 0.6);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis width={90} tickFormatter={(v) => money(v)} domain={[0, yMax]} />
          <Tooltip content={<EuroTooltip />} />
          <Line
            type="monotone"
            dataKey="per_head"
            name="Kosten pro Kopf"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
