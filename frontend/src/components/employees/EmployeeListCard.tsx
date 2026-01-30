import { Card } from "../ui/Card";
import type { EmployeeRow } from "../../api/employees";

export function EmployeeListCard({
  employees,
  selectedId,
  onSelect,
  onRefresh,
  loading,

  page,
  pageCount,
  total,
  canPrev,
  canNext,
  prevPage,
  nextPage,
}: {
  employees: EmployeeRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
  loading: boolean;

  page: number;
  pageCount: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  prevPage: () => void;
  nextPage: () => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-primary">Liste</div>
          <div className="text-xs text-muted">
            {total} Treffer · Seite {page} / {pageCount}
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="text-sm text-secondary hover:text-primary"
          type="button"
        >
          Aktualisieren
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-sm text-muted">Keine Treffer.</div>
      ) : (
        <div className="divide-y divide-border">
          {employees.map((e) => {
            const active = e.id === selectedId;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onSelect(e.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  active ? "bg-accent-soft border border-accent" : "hover:bg-accent-soft"
                }`}
              >
                <div className="font-medium text-primary">
                  {e.last_name}, {e.first_name}
                </div>
                <div className="text-xs text-muted">Pers.-Nr.: {e.external_id}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={prevPage}
          disabled={!canPrev}
          className="text-sm rounded-lg border border-border px-3 py-2 disabled:opacity-40 hover:bg-accent-soft"
        >
          ← Zurück
        </button>

        <button
          type="button"
          onClick={nextPage}
          disabled={!canNext}
          className="text-sm rounded-lg border border-border px-3 py-2 disabled:opacity-40 hover:bg-accent-soft"
        >
          Weiter →
        </button>
      </div>
    </Card>
  );
}
