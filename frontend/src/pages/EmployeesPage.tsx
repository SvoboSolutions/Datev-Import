import { EmployeeDetailCard } from "../components/employees/EmployeeDetailCard";
import { EmployeeListCard } from "../components/employees/EmployeeListCard";
import { useEmployeesPage } from "../hooks/useEmployeesPage";

function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-secondary">{subtitle}</p>
        ) : null}
      </div>

      {right ? <div className="w-full sm:w-auto">{right}</div> : null}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}

export function EmployeesPage() {
  const {
    employees,
    selectedId,
    setSelectedId,
    detail,
    query,
    setQuery,
    error,
    loadingEmployees,
    loadingDetail,
    refreshEmployees,

    page,
    pageCount,
    total,
    canPrev,
    canNext,
    prevPage,
    nextPage,
  } = useEmployeesPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mitarbeiter"
        subtitle="Payroll-Historie pro Monat"
        right={
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-[360px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                🔎
              </span>
              <input
                className="w-full rounded-xl border border-border/70 bg-surface/70 pl-9 pr-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                placeholder="Suchen (Name oder Pers.-Nr.)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={refreshEmployees}
              className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-xl
                         border border-border/70 bg-surface/70 text-sm text-secondary
                         hover:text-primary hover:bg-surface transition
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Aktualisieren
            </button>
          </div>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EmployeeListCard
          employees={employees}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRefresh={refreshEmployees}
          loading={loadingEmployees}
          page={page}
          pageCount={pageCount}
          total={total}
          canPrev={canPrev}
          canNext={canNext}
          prevPage={prevPage}
          nextPage={nextPage}
        />

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-1">
            <EmployeeDetailCard detail={detail} loading={loadingDetail} />
          </div>

          {!loadingDetail && !detail && selectedId ? (
            <div className="mt-3 text-sm text-secondary">
              Keine Details gefunden.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
