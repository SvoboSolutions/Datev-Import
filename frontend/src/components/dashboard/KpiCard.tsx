export function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        accent ? "bg-accent-soft border-accent" : "bg-surface border-border"
      }`}
    >
      <div className="text-sm text-secondary">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent ? "text-accent" : "text-primary"}`}>
        {value}
      </div>
    </div>
  );
}
