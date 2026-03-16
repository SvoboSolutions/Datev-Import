import type { OrgchartPerson } from "../../api/orgchart";
import { OrgPersonCard } from "./OrgPersonCard";

function groupTone(title: string) {
  if (title === "Standortleitung") {
    return {
      wrap: "border-sky-200 bg-sky-50/40",
      badge: "bg-sky-100 text-sky-800 border-sky-200",
    };
  }
  if (title === "Ärzte") {
    return {
      wrap: "border-emerald-200 bg-emerald-50/40",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }
  if (title === "MFA") {
    return {
      wrap: "border-violet-200 bg-violet-50/40",
      badge: "bg-violet-100 text-violet-800 border-violet-200",
    };
  }
  return {
    wrap: "border-slate-200 bg-slate-50/40",
    badge: "bg-slate-100 text-slate-800 border-slate-200",
  };
}

export function OrgPeopleGroup({
  title,
  people,
  onPersonClick,
}: {
  title: string;
  people: OrgchartPerson[];
  onPersonClick?: (employeeId: number, label: string) => void;
}) {
  if (!people.length) return null;

  const tone = groupTone(title);

  return (
    <div className={`rounded-2xl border p-3 ${tone.wrap}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone.badge}`}
        >
          {title}
        </div>
        <div className="text-[11px] text-secondary">{people.length}</div>
      </div>

      <div className="flex flex-wrap gap-3">
        {people.map((person) => (
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