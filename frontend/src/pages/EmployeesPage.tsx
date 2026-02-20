import type { ReactNode } from "react";
import { EmployeeDetailCard } from "../components/employees/EmployeeDetailCard";
import { EmployeeListCard } from "../components/employees/EmployeeListCard";
import { useEmployeesPage } from "../hooks/useEmployeesPage";

function Hero({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/70 p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/15 via-transparent to-accent/5" />
      <div className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
      <Hero
        title="Mitarbeiter"
        subtitle="Payroll-Historie pro Monat"
        right={
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-[360px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                🔎
              </span>
              <input
                className="w-full rounded-xl border border-border/70 bg-bg/60 pl-9 pr-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                placeholder="Suchen (Name oder Pers.-Nr.)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={refreshEmployees}
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium
                         bg-accent/15 text-primary border border-accent/30
                         hover:bg-accent/20 transition
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Aktualisieren
            </button>
          </div>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-surface/50 overflow-hidden">
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
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-surface/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent/70 via-accent/20 to-transparent" />
            <EmployeeDetailCard detail={detail} loading={loadingDetail} />
          </div>
        </div>
      </div>
    </div>
  );
}
