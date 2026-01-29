import type { PayrollRow } from "../../api/employees";
import { formatEuro } from "../../utils/format";

function fmt(v: number) {
  return formatEuro(v);
}

export function EmployeePayrollTable({
  rows,
  showDetails,
}: {
  rows: PayrollRow[];
  showDetails: boolean;
}) {
  const coreHeaders = ["Periode", "Gesamtkosten", "Brutto", "SV-AG"];
  const detailHeaders = [
    "AG-bAV",
    "Förderbetrag",
    "Netto",
    "Umlage",
    "Erst. KK",
    "Pausch. Steuern",
    "Erst. BA",
    "Erst. IfSG",
    "GK o. Erst.",
  ];

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface shadow-sm">
          <tr className="text-left text-xs uppercase tracking-wide text-secondary border-b border-border">
            {coreHeaders.map((h) => (
              <th key={h} className="py-2 px-3 whitespace-nowrap">
                {h}
              </th>
            ))}
            {showDetails &&
              detailHeaders.map((h) => (
                <th key={h} className="py-2 px-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {rows.map((r, idx) => (
            <tr
              key={r.period}
              className={idx % 2 === 0 ? "bg-bg/40" : "bg-surface"}
            >
              <td className="py-2 px-3 whitespace-nowrap font-medium">{r.period}</td>

              {/* Core */}
              <td className="py-2 px-3 text-right font-semibold whitespace-nowrap">
                {fmt(r.total_cost)}
              </td>
              <td className="py-2 px-3 text-right whitespace-nowrap">
                {fmt(r.gross_amount)}
              </td>
              <td className="py-2 px-3 text-right whitespace-nowrap">
                {fmt(r.sv_ag_amount)}
              </td>

              {/* Details */}
              {showDetails && (
                <>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.ag_bav_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.subsidy_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.net_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.umlage_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.reimb_kk_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.flat_tax_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.reimb_ba_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.reimb_ifsg_amount)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">{fmt(r.total_cost_wo_reimb)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
