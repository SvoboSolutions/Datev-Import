import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { deleteImport, listImports, type ImportJobRow } from "../api/imports";

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
  const s = (status ?? "").toLowerCase();

  if (s.includes("ok") || s.includes("success") || s.includes("done")) {
    return <span className={`${base} border-success bg-green-50 text-success`}>{status}</span>;
  }
  if (s.includes("error") || s.includes("fail")) {
    return <span className={`${base} border-error bg-red-50 text-error`}>{status}</span>;
  }
  return <span className={`${base} border-border bg-bg text-secondary`}>{status}</span>;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function DatasetsPage() {
  const [items, setItems] = useState<ImportJobRow[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const rows = await listImports();
      setItems(rows);
    } catch (e: any) {
      setError(e?.message ?? "Datensätze konnten nicht geladen werden");
    }
  }

  async function onDelete(id: number) {
    const ok = window.confirm("Diesen Datensatz wirklich löschen? (Payroll + alle Kostenzeilen)");
    if (!ok) return;

    try {
      setBusyId(id);
      await deleteImport(id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Löschen fehlgeschlagen");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Datensätze</h1>
        <p className="mt-1 text-sm text-secondary">Payroll – Import-Historie mit Löschfunktion</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-medium text-primary">Payroll</div>
            <div className="text-sm text-muted">letzte 100</div>
          </div>
          <button onClick={load} className="text-sm text-secondary hover:text-primary" type="button">
            Aktualisieren
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-error bg-red-50 px-3 py-2 text-sm text-error mb-3">
            {error}
          </div>
        )}

        {!items ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted">Noch keine Datensätze vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-border">
                  <th className="py-2">ID</th>
                  <th className="py-2">Periode</th>
                  <th className="py-2">Quelle</th>
                  <th className="py-2">Datei</th>
                  <th className="py-2">Zeilen</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Erstellt</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => (
                  <tr key={j.id} className="border-b border-border last:border-0 hover:bg-accent-soft">
                    <td className="py-2">{j.id}</td>
                    <td className="py-2">{j.period ?? "—"}</td>
                    <td className="py-2 text-secondary">{j.source_type}</td>
                    <td className="py-2">{j.filename}</td>
                    <td className="py-2">{j.row_count}</td>
                    <td className="py-2">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="py-2 text-secondary">{fmtDate(j.created_at)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(j.id)}
                        disabled={busyId === j.id}
                        className="text-sm rounded-lg border border-border px-3 py-2 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === j.id ? "Lösche…" : "Löschen"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}