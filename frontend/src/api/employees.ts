import { api } from "./client";

export type EmployeeRow = {
  id: number;
  external_id: string;
  first_name: string;
  last_name: string;
};

export type PayrollRow = {
  period: string;
  currency: string;
  gross_amount: number;
  sv_ag_amount: number;
  ag_bav_amount: number;
  subsidy_amount: number;
  net_amount: number;
  umlage_amount: number;
  reimb_kk_amount: number;
  flat_tax_amount: number;
  reimb_ba_amount: number;
  reimb_ifsg_amount: number;
  total_cost_wo_reimb: number;
  total_cost: number;
};

export type EmployeePayrollResponse = {
  employee: EmployeeRow;
  payroll: PayrollRow[];
};

export type EmployeesPageResponse = {
  items: EmployeeRow[];
  page: number;
  page_size: number;
  total: number;
};

export type LocationRow = {
  id: number;
  name: string;
};

export type EmployeeShortRow = {
  id: number;
  external_id: string;
  first_name: string;
  last_name: string;
};

export type EmployeeProfileRow = {
  id: number | null;
  employee_id: number;
  location_id: number | null;
  manager_employee_id: number | null;

  profession_type: string | null;
  org_role: string | null;
  is_executive: boolean;

  email: string | null;
  phone: string | null;
  entry_date: string | null;

  employment_type: string | null;
  weekly_hours: number | null;

  location: LocationRow | null;
  manager: EmployeeShortRow | null;
};

export type EmployeeProfileUpdatePayload = {
  location_id: number | null;
  manager_employee_id: number | null;

  profession_type: string | null;
  org_role: string | null;
  is_executive: boolean;

  email: string | null;
  phone: string | null;
  entry_date: string | null;

  employment_type: string | null;
  weekly_hours: number | null;
};

export type LocationCreatePayload = {
  name: string;
};

export async function fetchEmployeesPage(params: {
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<EmployeesPageResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.page_size) sp.set("page_size", String(params.page_size));
  const qs = sp.toString() ? `?${sp.toString()}` : "";
  return api<EmployeesPageResponse>(`/api/employees${qs}`);
}

export async function fetchEmployeePayroll(employeeId: number): Promise<EmployeePayrollResponse> {
  return api<EmployeePayrollResponse>(`/api/employees/${employeeId}/payroll`);
}

export async function fetchLocations(): Promise<LocationRow[]> {
  return api<LocationRow[]>(`/api/employees/locations/all`);
}

export async function createLocation(payload: LocationCreatePayload): Promise<LocationRow> {
  return api<LocationRow>(`/api/employees/locations`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchEmployeeProfile(employeeId: number): Promise<EmployeeProfileRow> {
  return api<EmployeeProfileRow>(`/api/employees/${employeeId}/profile`);
}

export async function updateEmployeeProfile(
  employeeId: number,
  payload: EmployeeProfileUpdatePayload
): Promise<EmployeeProfileRow> {
  return api<EmployeeProfileRow>(`/api/employees/${employeeId}/profile`, {
    method: "PUT",
    body: payload,
  });
}