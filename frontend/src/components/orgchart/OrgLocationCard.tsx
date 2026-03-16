import type { OrgchartLocationGroup } from "../../api/orgchart";
import { OrgPeopleGroup } from "./OrgPeopleGroup";

export function OrgLocationCard({
  location,
  onPersonClick,
}: {
  location: OrgchartLocationGroup;
  onPersonClick?: (employeeId: number, label: string) => void;
}) {
  const totalPeople =
    location.site_leads.length +
    location.doctors.length +
    location.mfas.length +
    location.administration.length;

  return (
    <section className="rounded-2xl border border-border/70 bg-surface/70 p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-semibold text-primary">{location.location_name}</h3>
          <p className="mt-0.5 text-xs text-secondary">Standort</p>
        </div>

        <div className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] text-secondary">
          {totalPeople} Personen
        </div>
      </div>

      <div className="space-y-3">
        <OrgPeopleGroup
          title="Standortleitung"
          people={location.site_leads}
          onPersonClick={onPersonClick}
        />
        <OrgPeopleGroup
          title="Ärzte"
          people={location.doctors}
          onPersonClick={onPersonClick}
        />
        <OrgPeopleGroup
          title="MFA"
          people={location.mfas}
          onPersonClick={onPersonClick}
        />
        <OrgPeopleGroup
          title="Verwaltung"
          people={location.administration}
          onPersonClick={onPersonClick}
        />
      </div>
    </section>
  );
}