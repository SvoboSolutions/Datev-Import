import { useEffect, useMemo, useState } from "react";
import {
  fetchEmployees,
  fetchEmployeePayroll,
  type EmployeeRow,
  type EmployeePayrollResponse,
} from "../api/employees";

export function useEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<EmployeePayrollResponse | null>(null);

  const [query, setQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function refreshEmployees() {
    try {
      setError(null);
      setLoadingEmployees(true);
      const rows = await fetchEmployees();
      setEmployees(rows);
      if (rows.length > 0 && selectedId == null) setSelectedId(rows[0].id);
    } catch (e: any) {
      setError(e?.message ?? "Mitarbeiter konnten nicht geladen werden");
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function loadDetail(employeeId: number) {
    try {
      setError(null);
      setLoadingDetail(true);
      setDetail(null);
      const d = await fetchEmployeePayroll(employeeId);
      setDetail(d);
    } catch (e: any) {
      setError(e?.message ?? "Payroll-Historie konnte nicht geladen werden");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    refreshEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    const s = query.trim().toLowerCase();
    if (!s) return employees;
    return employees.filter((e) => {
      const full = `${e.first_name} ${e.last_name} ${e.external_id}`.toLowerCase();
      return full.includes(s);
    });
  }, [employees, query]);

  return {
    employees,
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
  };
}
