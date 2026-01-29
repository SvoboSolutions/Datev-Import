import { api } from "./client";

export type Kpis = {
  period: string | null;
  employee_count: number;
  total_cost: number;
  total_gross: number;
  total_sv_ag: number;
  total_reimb_kk: number;
  total_reimb_ba: number;
  total_reimb_ifsg: number;
  last_import_status: string | null;
};

export type MonthlyRow = {
  period: string;
  employee_count: number;
  total_cost: number;
  gross: number;
  sv_ag: number;
  umlage: number;
  ag_bav: number;
  flat_tax: number;
  reimb_kk: number;
  reimb_ba: number;
  reimb_ifsg: number;
};

export type TopEmployeeItem = {
  employee_id: number;
  external_id: string;
  first_name: string;
  last_name: string;
  total_cost: number;
};

export type TopEmployeesResponse = {
  period: string | null;
  items: TopEmployeeItem[];
};

export type HotspotItem = {
  external_id: string;
  first_name: string;
  last_name: string;
  total_cost: number;
};

export type HotspotPeriod = {
  period: string;
  items: HotspotItem[];
};

export async function fetchPeriods(): Promise<string[]> {
  return api<string[]>("/api/dashboard/periods");
}

export async function fetchKpis(period?: string): Promise<Kpis> {
  const q = period ? `?period=${encodeURIComponent(period)}` : "";
  return api<Kpis>(`/api/dashboard/kpis${q}`);
}

export async function fetchMonthlyCosts(): Promise<MonthlyRow[]> {
  return api<MonthlyRow[]>("/api/dashboard/monthly-costs");
}

export async function fetchTopEmployees(
  period?: string,
  limit = 5,
): Promise<TopEmployeesResponse> {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  params.set("limit", String(limit));
  const q = params.toString() ? `?${params.toString()}` : "";
  return api<TopEmployeesResponse>(`/api/dashboard/top-employees${q}`);
}

export async function fetchHotspots(limit = 5): Promise<HotspotPeriod[]> {
  return api<HotspotPeriod[]>(`/api/dashboard/hotspots?limit=${limit}`);
}
