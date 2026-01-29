import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { money, periodLabel, toNumber } from "../../charts/formatters";

function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function RateTooltip({
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

  const total = toNumber(d.total_cost);
  const reimb = toNumber(d.reimb_total);
  const rate = toNumber(d.reimb_rate);

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <div className="text-sm font-semibold mb-2">{periodLabel(String(label))}</div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Erstattungen</span>
          <span className="font-semibold text-primary">{money(reimb)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Gesamtkosten</span>
          <span className="font-semibold text-primary">{money(total)}</span>
        </div>
        <div className="my-2 h-px bg-border" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Erstattungsquote</span>
          <span className="font-semibold text-primary">{pct(rate)}</span>
        </div>
      </div>
    </div>
  );
}

export function ReimbursementRateChart({
  rows,
}: {
  rows: {
    period: string;
    total_cost: number;
    reimb_kk: number;
    reimb_ba: number;
    reimb_ifsg: number;
  }[];
}) {
  const data = [...rows]
    .map((r) => {
      const total = toNumber(r.total_cost);
      const reimb = toNumber(r.reimb_kk) + toNumber(r.reimb_ba) + toNumber(r.reimb_ifsg);
      const rate = total > 0 ? reimb / total : 0;
      return {
        period: r.period,
        total_cost: total,
        reimb_total: reimb,
        reimb_rate: rate, // 0..1
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  // Ziel: max ~60% der Höhe (wie bei deinem Trendchart)
  const maxRate = data.reduce((m, r) => Math.max(m, r.reimb_rate), 0);
  const yMax = maxRate <= 0 ? 0.2 : Math.min(1, maxRate / 0.6); // cap at 100%

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis
            width={70}
            domain={[0, yMax]}
            tickFormatter={(v) => pct(toNumber(v))}
          />
          <Tooltip content={<RateTooltip />} />
          <Line
            type="monotone"
            dataKey="reimb_rate"
            name="Erstattungsquote"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
