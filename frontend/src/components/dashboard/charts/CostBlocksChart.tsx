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

export function CostBlocksChart({
  rows,
}: {
  rows: { period: string; sv_ag: number; umlage: number; ag_bav: number; flat_tax: number }[];
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="22%"  // Abstand zwischen Perioden
          barGap={6}            // Abstand zwischen Bars innerhalb einer Periode
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis tickFormatter={(v) => money(v)} width={90} />
          <Tooltip content={<EuroTooltip />} />
          <Legend />

          {/* GROUPED: kein stackId */}
          <Bar dataKey="sv_ag" name="SV-AG" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="umlage" name="Umlage" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          <Bar dataKey="ag_bav" name="AG-bAV" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="flat_tax" name="Pausch. Steuern" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
