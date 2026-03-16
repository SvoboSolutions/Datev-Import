import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
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

  const maxVal = data.reduce((m, r) => Math.max(m, r.per_head), 0);
  const yMax = maxVal <= 0 ? 1 : Math.ceil(maxVal * 1.15);

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 28, right: 24, bottom: 8, left: 12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis
            dataKey="period"
            tickFormatter={periodLabel}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={110}
            tickFormatter={(v) => money(v)}
            domain={[0, yMax]}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<EuroTooltip />} />
          <Line
            type="monotone"
            dataKey="per_head"
            name="Kosten pro Kopf"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="per_head"
              position="top"
              formatter={(value) => money(toNumber(value))}
              style={{ fontSize: 11, fill: "#0f172a", fontWeight: 600 }}
              offset={10}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}