import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/Card";
import type {
  EmployeePayrollResponse,
  EmployeeProfileRow,
  EmployeeProfileUpdatePayload,
  EmployeeRow,
  LocationRow,
} from "../../api/employees";
import {
  createLocation,
  fetchEmployeeProfile,
  fetchEmployeesPage,
  fetchLocations,
  updateEmployeeProfile,
} from "../../api/employees";
import { EmployeeProfileForm, type ProfileFormState } from "./EmployeeProfileForm";

function toFormState(profile: EmployeeProfileRow): ProfileFormState {
  return {
    location_id: profile.location_id,
    manager_employee_id: profile.manager_employee_id,
    profession_type: profile.profession_type,
    org_role: profile.org_role ?? "none",
    is_executive: profile.is_executive ?? false,
    email: profile.email,
    phone: profile.phone,
    entry_date: profile.entry_date,
    employment_type: profile.employment_type,
    weekly_hours: profile.weekly_hours,
  };
}

function emptyFormState(): ProfileFormState {
  return {
    location_id: null,
    manager_employee_id: null,
    profession_type: null,
    org_role: "none",
    is_executive: false,
    email: null,
    phone: null,
    entry_date: null,
    employment_type: null,
    weekly_hours: null,
  };
}

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function EmployeeProfileSection({
  detail,
}: {
  detail: EmployeePayrollResponse;
}) {
  const [profile, setProfile] = useState<EmployeeProfileRow | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyFormState());
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeRow[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const employeeId = detail.employee.id;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        setProfileSuccess(null);

        const [profileRes, locationRes, employeeRes] = await Promise.all([
          fetchEmployeeProfile(employeeId),
          fetchLocations(),
          fetchEmployeesPage({ page: 1, page_size: 100 }),
        ]);

        if (!active) return;

        setProfile(profileRes);
        setForm(toFormState(profileRes));
        setLocations(locationRes);
        setEmployeeOptions(employeeRes.items.filter((e) => e.id !== employeeId));
      } catch (e: any) {
        if (!active) return;
        setProfileError(e?.message ?? "Profildaten konnten nicht geladen werden");
      } finally {
        if (active) setProfileLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [employeeId]);

  const managerLabel = useMemo(() => {
    if (!profile?.manager) return "–";
    return `${profile.manager.last_name}, ${profile.manager.first_name}`;
  }, [profile]);

  async function handleSaveProfile() {
    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      const payload: EmployeeProfileUpdatePayload = {
        location_id: form.location_id,
        manager_employee_id: form.manager_employee_id,
        profession_type: form.profession_type,
        org_role: form.org_role ?? "none",
        is_executive: form.is_executive,
        email: normalizeText(form.email ?? ""),
        phone: normalizeText(form.phone ?? ""),
        entry_date: form.entry_date || null,
        employment_type: form.employment_type,
        weekly_hours:
          form.weekly_hours === null || Number.isNaN(form.weekly_hours)
            ? null
            : Number(form.weekly_hours),
      };

      const saved = await updateEmployeeProfile(employeeId, payload);
      setProfile(saved);
      setForm(toFormState(saved));
      setProfileSuccess("Profildaten gespeichert.");
    } catch (e: any) {
      setProfileError(e?.message ?? "Profildaten konnten nicht gespeichert werden");
    } finally {
      setSavingProfile(false);
    }
  }

  function resetForm() {
    if (!profile) return;
    setForm(toFormState(profile));
    setProfileError(null);
    setProfileSuccess(null);
  }

  async function handleCreateLocation(name: string) {
    try {
      setCreatingLocation(true);
      setProfileError(null);

      const created = await createLocation({ name });
      setLocations((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, location_id: created.id }));
      setProfileSuccess(`Standort „${created.name}“ angelegt.`);
    } finally {
      setCreatingLocation(false);
    }
  }

  return (
    <Card>
      {profileLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      ) : (
        <div className="space-y-4">
          {profileError ? (
            <div className="rounded-xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
              {profileError}
            </div>
          ) : null}

          {profileSuccess ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {profileSuccess}
            </div>
          ) : null}

          <EmployeeProfileForm
            form={form}
            setForm={setForm}
            locations={locations}
            employeeOptions={employeeOptions}
            managerLabel={managerLabel}
            savingProfile={savingProfile}
            onSave={handleSaveProfile}
            onReset={resetForm}
            onCreateLocation={handleCreateLocation}
            creatingLocation={creatingLocation}
          />
        </div>
      )}
    </Card>
  );
}