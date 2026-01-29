import { EmployeeDetailCard } from "../components/employees/EmployeeDetailCard";
import { EmployeeListCard } from "../components/employees/EmployeeListCard";
import { useEmployeesPage } from "../hooks/useEmployeesPage";

export function EmployeesPage() {
  const {
    filteredEmployees,
    selectedId,
    setSelectedId,
    detail,
    query,
    setQuery,
    showDetails,
    setShowDetails,
    error,
    loadingEmployees,
    loadingDetail,
    refreshEmployees,
  } = useEmployeesPage();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mitarbeiter</h1>
          <p className="mt-1 text-sm text-secondary">Payroll-Historie pro Monat</p>
        </div>

        <div className="w-full max-w-sm">
          <input
            className="w-full border border-border rounded px-3 py-2 bg-surface"
            placeholder="Suchen (Name oder Pers.-Nr.)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-red-50 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EmployeeListCard
          employees={filteredEmployees}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRefresh={refreshEmployees}
          loading={loadingEmployees}
        />

        <div className="lg:col-span-2">
          <EmployeeDetailCard
            detail={detail}
            loading={loadingDetail}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}
