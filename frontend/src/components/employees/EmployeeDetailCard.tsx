import { Card } from "../ui/Card";
import type { EmployeePayrollResponse } from "../../api/employees";
import { AccordionSection } from "../ui/AccordionSection";
import { EmployeePayrollChart } from "./EmployeePayrollChart";
import { EmployeePayrollTable } from "./EmployeePayrollTable";
import { EmployeeStatsSection } from "./EmployeeStatsSection";

export function EmployeeDetailCard({
  detail,
  loading,
  showDetails,
  onToggleDetails,
}: {
  detail: EmployeePayrollResponse | null;
  loading: boolean;
  showDetails: boolean;
  onToggleDetails: () => void;
}) {
  if (loading && !detail) {
    return (
      <Card>
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      </Card>
    );
  }

  if (!detail) {
    return (
      <Card>
        <div className="text-sm text-muted">Bitte Mitarbeiter auswählen.</div>
      </Card>
    );
  }

  const chartRows = [...detail.payroll]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((r) => ({
      period: r.period,
      total_cost: r.total_cost,
      gross_amount: r.gross_amount,
      sv_ag_amount: r.sv_ag_amount,
    }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-secondary">Ausgewählt</div>
            <div className="text-lg font-semibold text-primary">
              {detail.employee.last_name}, {detail.employee.first_name}
            </div>
            <div className="text-xs text-muted">Pers.-Nr.: {detail.employee.external_id}</div>
          </div>
        </div>
      </Card>

      {/* Kennzahlen als eigener Accordion */}
      <AccordionSection
        title="Kennzahlen"
        subtitle="Aktueller Monat + Vergleich zum Vormonat"
        defaultOpen={true}
      >
        <EmployeeStatsSection payroll={detail.payroll} />
      </AccordionSection>

      {/* Verlauf & Tabelle */}
      <AccordionSection
        title="Verlauf"
        subtitle="Zeitreihe und Tabelle"
        defaultOpen={true}
        right={
          <button
            type="button"
            onClick={onToggleDetails}
            className="text-sm rounded-lg border border-border px-3 py-2 hover:bg-accent-soft"
          >
            {showDetails ? "Details ausblenden" : "Details anzeigen"}
          </button>
        }
      >
        <EmployeePayrollChart rows={chartRows} />
        <EmployeePayrollTable rows={detail.payroll} showDetails={showDetails} />
      </AccordionSection>
    </div>
  );
}
