import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { EuroTooltip } from "../../charts/EuroTooltip";
import { money, periodLabel, toNumber } from "../../charts/formatters";

export function CostTrendChart({
  rows,
}: {
  rows: { period: string; total_cost: number }[];
}) {
  const data = [...rows]
    .map((r) => ({
      period: r.period,
      total_cost: toNumber(r.total_cost),
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const maxVal = data.reduce((m, r) => Math.max(m, r.total_cost), 0);
  const yMin = 0;
  const yMax = maxVal <= 0 ? 1 : Math.ceil(maxVal * 1.15);

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 28, right: 24, bottom: 8, left: 12 }}>
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
            domain={[yMin, yMax]}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<EuroTooltip />} />
          <Area
            type="monotone"
            dataKey="total_cost"
            name="Gesamtkosten"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.18}
            strokeWidth={3}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="total_cost"
              position="top"
              formatter={(value) => money(toNumber(value))}
              style={{ fontSize: 11, fill: "#0f172a", fontWeight: 600 }}
              offset={10}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}