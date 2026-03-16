import type { OrgchartPerson } from "../../api/orgchart";
import { OrgPersonCard } from "./OrgPersonCard";

export function OrgExecutiveSection({
  executives,
  onPersonClick,
}: {
  executives: OrgchartPerson[];
  onPersonClick?: (employeeId: number, label: string) => void;
}) {
  if (!executives.length) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-primary">Geschäftsführung</h2>
        <p className="text-xs text-secondary">Oberste Leitungsebene</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {executives.map((person) => (
          <OrgPersonCard
            key={person.employee_id}
            person={person}
            onClick={onPersonClick}
          />
        ))}
      </div>
    </div>
  );
}