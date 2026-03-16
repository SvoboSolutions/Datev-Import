import type { EmployeeRow, LocationRow } from "../../api/employees";
import { LocationCreateInline } from "./LocationCreateInline";

export type ProfileFormState = {
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

export function EmployeeProfileForm({
  form,
  setForm,
  locations,
  employeeOptions,
  managerLabel,
  savingProfile,
  onSave,
  onReset,
  onCreateLocation,
  creatingLocation,
  compact = false,
}: {
  form: ProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  locations: LocationRow[];
  employeeOptions: EmployeeRow[];
  managerLabel: string;
  savingProfile: boolean;
  onSave: () => Promise<void>;
  onReset: () => void;
  onCreateLocation: (name: string) => Promise<void>;
  creatingLocation: boolean;
  compact?: boolean;
}) {
  const gridClass = compact
    ? "grid grid-cols-1 gap-3 md:grid-cols-2"
    : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

  const inputClass =
    "w-full rounded-xl border border-border bg-bg/60 px-3 py-2 text-sm text-primary outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/50";

  return (
    <div className="space-y-4">
      <div className={gridClass}>
        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Berufsgruppe</span>
          <select
            value={form.profession_type ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                profession_type: e.target.value || null,
              }))
            }
            className={inputClass}
          >
            <option value="">Bitte wählen</option>
            <option value="Arzt">Arzt</option>
            <option value="MFA">MFA</option>
            <option value="Verwaltung">Verwaltung</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Standortfunktion</span>
          <select
            value={form.org_role ?? "none"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                org_role: e.target.value || "none",
              }))
            }
            className={inputClass}
          >
            <option value="none">Keine</option>
            <option value="site_lead">Standortleitung</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-bg/40 px-3 py-2">
          <input
            type="checkbox"
            checked={form.is_executive}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                is_executive: e.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          <div>
            <div className="text-sm font-medium text-primary">Geschäftsführung</div>
            <div className="text-xs text-secondary">Person zusätzlich oben anzeigen</div>
          </div>
        </label>

        <div className="space-y-2">
          <label className="block">
            <span className="mb-1 block text-sm text-secondary">Standort</span>
            <select
              value={form.location_id ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location_id: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className={inputClass}
            >
              <option value="">Bitte wählen</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>

          <LocationCreateInline onCreate={onCreateLocation} loading={creatingLocation} />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Vorgesetzte Person</span>
          <select
            value={form.manager_employee_id ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                manager_employee_id: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className={inputClass}
          >
            <option value="">Keine</option>
            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.last_name}, {employee.first_name}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-muted">Aktuell: {managerLabel}</div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">E-Mail</span>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Telefon</span>
          <input
            type="text"
            value={form.phone ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Eintrittsdatum</span>
          <input
            type="date"
            value={form.entry_date ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                entry_date: e.target.value || null,
              }))
            }
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Beschäftigungsart</span>
          <select
            value={form.employment_type ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                employment_type: e.target.value || null,
              }))
            }
            className={inputClass}
          >
            <option value="">Bitte wählen</option>
            <option value="Vollzeit">Vollzeit</option>
            <option value="Teilzeit">Teilzeit</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-secondary">Wochenstunden</span>
          <input
            type="number"
            step="0.25"
            min="0"
            value={form.weekly_hours ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                weekly_hours: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={savingProfile}
          className="inline-flex items-center justify-center rounded-xl border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProfile ? "Speichern ..." : "Speichern"}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={savingProfile}
          className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-primary transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}