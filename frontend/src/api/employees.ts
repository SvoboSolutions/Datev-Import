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

export async function fetchEmployees(): Promise<EmployeeRow[]> {
  return api<EmployeeRow[]>("/api/employees");
}

export async function fetchEmployeePayroll(employeeId: number): Promise<EmployeePayrollResponse> {
  return api<EmployeePayrollResponse>(`/api/employees/${employeeId}/payroll`);
}
