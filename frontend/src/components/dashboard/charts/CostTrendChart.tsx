// src/components/dashboard/charts/CostTrendChart.tsx
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

  // Ziel: höchster Punkt ~60% der Chart-Höhe
  const targetFill = 0.60;

  const yMin = 0;

  // wenn alles 0 ist: sinnvolle Skala
  const yMax =
    maxVal <= 0 ? 1 : Math.ceil(maxVal / targetFill);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 18, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis
            width={90}
            tickFormatter={(v) => money(v)}
            domain={[yMin, yMax]}
          />
          <Tooltip content={<EuroTooltip />} />
          <Area
            type="monotone"
            dataKey="total_cost"
            name="Gesamtkosten"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.2}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
