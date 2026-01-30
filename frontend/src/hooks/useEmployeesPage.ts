import { useEffect, useMemo, useState } from "react";
import {
  fetchEmployeesPage,
  fetchEmployeePayroll,
  type EmployeeRow,
  type EmployeePayrollResponse,
} from "../api/employees";

const PAGE_SIZE = 25;
const DEBOUNCE_MS = 250;

export function useEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<EmployeePayrollResponse | null>(null);

  const [showDetails, setShowDetails] = useState(false); // falls du es noch in der Page brauchst
  const [error, setError] = useState<string | null>(null);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // debounce query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Wenn query geändert wird: zurück auf Seite 1
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  async function refreshEmployees() {
    try {
      setError(null);
      setLoadingEmployees(true);

      const res = await fetchEmployeesPage({
        q: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
        page,
        page_size: PAGE_SIZE,
      });

      setEmployees(res.items);
      setTotal(res.total);

      // auto-select first if nothing selected or selected not in current page
      if (res.items.length > 0) {
        const stillThere = selectedId != null && res.items.some((e) => e.id === selectedId);
        if (selectedId == null || !stillThere) setSelectedId(res.items[0].id);
      } else {
        setSelectedId(null);
        setDetail(null);
      }
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

  // Load employees when page or debouncedQuery changes
  useEffect(() => {
    refreshEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery]);

  // Load detail when selection changes
  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return {
    employees,
    total,
    page,
    pageCount,
    pageSize: PAGE_SIZE,

    query,
    setQuery,

    selectedId,
    setSelectedId,

    detail,

    showDetails,
    setShowDetails,

    error,
    loadingEmployees,
    loadingDetail,

    refreshEmployees,

    canPrev: page > 1,
    canNext: page < pageCount,
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    nextPage: () => setPage((p) => Math.min(pageCount, p + 1)),
    setPage,
  };
}
