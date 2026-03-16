import type { OrgchartPerson } from "../../api/orgchart";

function headline(person: OrgchartPerson) {
  if (person.is_executive && person.org_role === "site_lead") {
    return "Geschäftsführung · Standortleitung";
  }
  if (person.is_executive) return "Geschäftsführung";
  if (person.org_role === "site_lead" && person.profession_type) {
    return `Standortleitung · ${person.profession_type}`;
  }
  if (person.profession_type) return person.profession_type;
  return "Mitarbeiter";
}

function toneClasses(person: OrgchartPerson) {
  if (person.is_executive) return "border-amber-200 bg-amber-50/70";
  if (person.org_role === "site_lead") return "border-sky-200 bg-sky-50/70";
  if (person.profession_type === "Arzt") return "border-emerald-200 bg-emerald-50/70";
  if (person.profession_type === "MFA") return "border-violet-200 bg-violet-50/70";
  if (person.profession_type === "Verwaltung") return "border-slate-200 bg-slate-50/70";
  return "border-border/70 bg-surface/70";
}

export function OrgPersonCard({
  person,
  onClick,
}: {
  person: OrgchartPerson;
  onClick?: (employeeId: number, label: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onClick?.(person.employee_id, `${person.last_name}, ${person.first_name}`)
      }
      className={[
        "w-full max-w-[240px] min-h-[116px] rounded-xl border p-3 text-left shadow-sm transition",
        "hover:-translate-y-0.5 hover:shadow-md",
        toneClasses(person),
      ].join(" ")}
    >
      <div className="text-sm font-semibold leading-tight text-primary">
        {person.last_name}, {person.first_name}
      </div>

      <div className="mt-1 text-[11px] font-medium text-secondary">{headline(person)}</div>

      <div className="mt-2 space-y-0.5 text-xs text-secondary">
        {person.phone ? <div>Tel.: {person.phone}</div> : null}
        {person.email ? <div className="truncate">E-Mail: {person.email}</div> : null}
      </div>
    </button>
  );
}