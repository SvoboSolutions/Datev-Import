import { api } from "./client";

export type OrgchartPerson = {
  employee_id: number;
  external_id: string;
  first_name: string;
  last_name: string;
  profession_type: string | null;
  org_role: string | null;
  is_executive: boolean;
  email: string | null;
  phone: string | null;
  employment_type: string | null;
  weekly_hours: number | null;
};

export type OrgchartLocationGroup = {
  location_id: number;
  location_name: string;
  site_leads: OrgchartPerson[];
  doctors: OrgchartPerson[];
  mfas: OrgchartPerson[];
  administration: OrgchartPerson[];
};

export type OrgchartResponse = {
  executives: OrgchartPerson[];
  locations: OrgchartLocationGroup[];
};

export async function fetchOrgchart(): Promise<OrgchartResponse> {
  return api<OrgchartResponse>("/api/orgchart");
}