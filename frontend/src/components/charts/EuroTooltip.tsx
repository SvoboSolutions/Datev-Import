import { money, periodLabel } from "./formatters";

type PayloadItem = {
  name?: string;
  value?: number;
  color?: string;
};

export function EuroTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: any;
  payload?: PayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const rows = payload
    .filter((p) => p && typeof p.value === "number")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const sum = rows.reduce((acc, r) => acc + (r.value ?? 0), 0);

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <div className="text-sm font-semibold mb-2">{periodLabel(String(label))}</div>

      <div className="space-y-1">
        {rows.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: r.color ?? "#64748b" }}
              />
              <span className="text-secondary">{r.name ?? "Wert"}</span>
            </div>
            <span className="font-medium text-primary">{money(r.value)}</span>
          </div>
        ))}
      </div>

      {rows.length > 1 && (
        <>
          <div className="my-2 h-px bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Summe</span>
            <span className="font-semibold">{money(sum)}</span>
          </div>
        </>
      )}
    </div>
  );
}
