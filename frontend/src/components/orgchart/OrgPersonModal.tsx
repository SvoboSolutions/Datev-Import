import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/Card";
import type {
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
import { EmployeeProfileForm, type ProfileFormState } from "../employees/EmployeeProfileForm";

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

export function OrgPersonModal({
  employeeId,
  title,
  onClose,
  onSaved,
}: {
  employeeId: number | null;
  title: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [profile, setProfile] = useState<EmployeeProfileRow | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyFormState());
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, locationRes, employeeRes] = await Promise.all([
          fetchEmployeeProfile(employeeId),
          fetchLocations(),
          fetchEmployeesPage({ page: 1, page_size: 200 }),
        ]);

        if (!active) return;

        setProfile(profileRes);
        setForm(toFormState(profileRes));
        setLocations(locationRes);
        setEmployeeOptions(employeeRes.items.filter((e) => e.id !== employeeId));
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Profildaten konnten nicht geladen werden");
      } finally {
        if (active) setLoading(false);
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

  if (!employeeId) return null;

  async function handleSave() {
    if (!employeeId) return;
    try {
      setSaving(true);
      setError(null);

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
      await onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (profile) {
      setForm(toFormState(profile));
      setError(null);
    }
  }

  async function handleCreateLocation(name: string) {
    const created = await createLocation({ name });
    setLocations((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((prev) => ({ ...prev, location_id: created.id }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="w-full max-w-4xl">
        <Card>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">{title}</h3>
              <p className="text-sm text-secondary">Profildaten direkt im Organigramm bearbeiten</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent-soft"
            >
              Schließen
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          ) : (
            <div className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              ) : null}

              <EmployeeProfileForm
                form={form}
                setForm={setForm}
                locations={locations}
                employeeOptions={employeeOptions}
                managerLabel={managerLabel}
                savingProfile={saving}
                onSave={handleSave}
                onReset={handleReset}
                onCreateLocation={handleCreateLocation}
                creatingLocation={creatingLocation}
                compact
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}