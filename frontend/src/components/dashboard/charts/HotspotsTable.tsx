import { money, periodLabel } from "../../charts/formatters";
import type { HotspotPeriod } from "../../../api/dashboard";

export function HotspotsTable({
  data,
}: {
  data: HotspotPeriod[];
}) {
  if (!data.length) {
    return <div className="text-sm text-muted">Keine Daten vorhanden.</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((p) => (
        <div key={p.period} className="rounded-lg border border-border overflow-hidden">
          <div className="px-3 py-2 bg-accent-soft flex items-center justify-between">
            <div className="text-sm font-semibold text-primary">
              {periodLabel(p.period)}
            </div>
            <div className="text-xs text-secondary">Top {p.items.length}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-border">
                  <th className="py-2 px-3">Pers.-Nr.</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3 text-right">Gesamtkosten</th>
                </tr>
              </thead>
              <tbody>
                {p.items.map((it) => (
                  <tr key={it.external_id} className="border-b border-border last:border-0">
                    <td className="py-2 px-3 font-medium">{it.external_id}</td>
                    <td className="py-2 px-3 text-secondary">
                      {it.last_name}, {it.first_name}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {money(it.total_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
