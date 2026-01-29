import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EuroTooltip } from "../../charts/EuroTooltip";
import { money, periodLabel } from "../../charts/formatters";

export function ReimbursementsChart({
  rows,
}: {
  rows: { period: string; reimb_kk: number; reimb_ba: number; reimb_ifsg: number }[];
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="22%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis tickFormatter={(v) => money(v)} width={90} />
          <Tooltip content={<EuroTooltip />} />
          <Legend />

          {/* GROUPED */}
          <Bar dataKey="reimb_kk" name="Erstattung KK" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="reimb_ba" name="Erstattung BA" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="reimb_ifsg" name="Erstattung IfSG" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
