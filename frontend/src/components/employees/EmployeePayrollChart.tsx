import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EuroTooltip } from "../charts/EuroTooltip";
import { money, periodLabel } from "../charts/formatters";

export function EmployeePayrollChart({
  rows,
}: {
  rows: { period: string; total_cost: number; gross_amount: number; sv_ag_amount: number }[];
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="period" tickFormatter={periodLabel} />
          <YAxis tickFormatter={(v) => money(v)} width={90} />
          <Tooltip content={<EuroTooltip />} />
          <Legend />

          <Line
            type="monotone"
            dataKey="total_cost"
            name="Gesamtkosten"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="gross_amount"
            name="Brutto"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sv_ag_amount"
            name="SV-AG"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
