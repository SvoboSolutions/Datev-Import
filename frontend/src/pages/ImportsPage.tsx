import { useEffect, useState } from "react";
import { CsvUpload } from "../components/upload/CsvUpload";
import { Card } from "../components/ui/Card";
import { listImports, type ImportJob } from "../api/imports";

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
  const s = status.toLowerCase();

  if (s.includes("success") || s.includes("done") || s.includes("finished")) {
    return <span className={`${base} border-success bg-green-50 text-success`}>{status}</span>;
  }
  if (s.includes("fail") || s.includes("error")) {
    return <span className={`${base} border-error bg-red-50 text-error`}>{status}</span>;
  }
  return <span className={`${base} border-border bg-bg text-secondary`}>{status}</span>;
}

export function ImportsPage() {
  const [items, setItems] = useState<ImportJob[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const jobs = await listImports();
      setItems(jobs);
    } catch (e: any) {
      setError(e?.message ?? "Import-Historie konnte nicht geladen werden");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">CSV-Import</h1>
        <p className="mt-2 text-sm text-secondary max-w-2xl">
          Lade DATEV-CSV-Dateien hoch. Der Import läuft serverseitig und erscheint anschließend in der Historie.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-sm font-medium text-primary">Upload</div>
            <div className="text-xs text-muted">Nur *.csv</div>
          </div>
          <button
            onClick={load}
            className="text-sm text-secondary hover:text-primary"
            type="button"
          >
            Historie aktualisieren
          </button>
        </div>
        <CsvUpload />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-primary">Import-Historie</h2>
          <span className="text-sm text-muted">letzte 50</span>
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
          <div className="text-sm text-muted">Noch keine Imports vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-secondary border-b border-border">
                  <th className="py-2">ID</th>
                  <th className="py-2">Datei</th>
                  <th className="py-2">Periode</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => (
                  <tr key={j.id} className="border-b border-border last:border-0 hover:bg-accent-soft">
                    <td className="py-2">{j.id}</td>
                    <td className="py-2">{j.filename}</td>
                    <td className="py-2 text-secondary">{j.period ?? "—"}</td>
                    <td className="py-2">
                      <StatusBadge status={j.status} />
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
