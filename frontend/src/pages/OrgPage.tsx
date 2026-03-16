import { useEffect, useState } from "react";
import { fetchOrgchart, type OrgchartResponse } from "../api/orgchart";
import { OrgExecutiveSection } from "../components/orgchart/OrgExecutiveSection";
import { OrgLocationCard } from "../components/orgchart/OrgLocationCard";
import { OrgPersonModal } from "../components/orgchart/OrgPersonModal";

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}

export function OrgchartPage() {
  const [data, setData] = useState<OrgchartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrgchart();
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Organigramm konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function handlePersonClick(employeeId: number, label: string) {
    setSelectedEmployeeId(employeeId);
    setSelectedLabel(label);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (!data) {
    return <ErrorBanner message="Keine Organigramm-Daten vorhanden." />;
  }

  return (
    <>
      <div className="space-y-5">
        <div className="rounded-2xl border border-border/60 bg-surface/70 p-5">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Organigramm</h1>
          <p className="mt-1 text-sm text-secondary">
            Kompakte Ansicht für viele Personen. Klick auf eine Karte öffnet die Bearbeitung.
          </p>
        </div>

        <OrgExecutiveSection executives={data.executives} onPersonClick={handlePersonClick} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {data.locations.map((location) => (
            <OrgLocationCard
              key={location.location_id}
              location={location}
              onPersonClick={handlePersonClick}
            />
          ))}
        </div>
      </div>

      <OrgPersonModal
        employeeId={selectedEmployeeId}
        title={selectedLabel}
        onClose={() => {
          setSelectedEmployeeId(null);
          setSelectedLabel("");
        }}
        onSaved={load}
      />
    </>
  );
}