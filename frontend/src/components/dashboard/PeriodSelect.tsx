import { periodLabel } from "../charts/formatters";

export function PeriodSelect({
  periods,
  value,
  onChange,
}: {
  periods: string[];
  value: string;
  onChange: (p: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-secondary">Periode</div>
      <select
        className="border border-border bg-surface rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {periods.map((p) => (
          <option key={p} value={p}>
            {periodLabel(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
