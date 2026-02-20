import { useEffect, useState } from "react";
import { CsvUpload } from "../components/upload/CsvUpload";
import { Card } from "../components/ui/Card";
import { listImports, type ImportJobRow } from "../api/imports";

function Hero({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/70 p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/15 via-transparent to-accent/5" />
      <div className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-secondary max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="w-full sm:w-auto">{right}</div> : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";
  const s = status.toLowerCase();

  if (s.includes("success") || s.includes("done") || s.includes("finished")) {
    return <span className={`${base} border-success/40 bg-green-50 text-success`}>{status}</span>;
  }
  if (s.includes("fail") || s.includes("error")) {
    return <span className={`${base} border-error/40 bg-red-50 text-error`}>{status}</span>;
  }
  return <span className={`${base} border-accent/25 bg-accent/10 text-primary`}>{status}</span>;
}

export function ImportsPage() {
  const [items, setItems] = useState<ImportJobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setRefreshing(true);
      setError(null);
      setItems(await listImports());
    } catch (e: any) {
      setError(e?.message ?? "Import-Historie konnte nicht geladen werden");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Hero
        title="CSV-Import"
        subtitle="Lade DATEV-CSV-Dateien hoch. Der Import läuft serverseitig und erscheint anschließend in der Historie."
        right={
          <button
            onClick={load}
            type="button"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium
                       bg-accent/15 text-primary border border-accent/30
                       hover:bg-accent/20 transition
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {refreshing ? "Aktualisiere…" : "Historie aktualisieren"}
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-sm font-semibold text-primary">Upload</div>
            <div className="text-xs text-muted mt-0.5">Nur *.csv</div>
          </div>
          <span className="text-xs text-secondary bg-accent/10 border border-accent/20 px-2 py-1 rounded-full">
            Tipp: nach Upload refreshen
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-accent/35 bg-accent/5 p-4">
          <CsvUpload />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Import-Historie</h2>
            <p className="text-xs text-muted mt-0.5">Letzte 50 Jobs</p>
          </div>
          <div className="text-xs text-muted">{items ? `${items.length} Einträge` : "lädt…"}</div>
        </div>

        {!items ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted">Noch keine Imports vorhanden.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-accent/10">
                <tr className="text-left text-secondary border-b border-accent/15">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Datei</th>
                  <th className="py-3 px-4 font-medium">Periode</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => (
                  <tr
                    key={j.id}
                    className="border-b border-border/60 last:border-0 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-primary">{j.id}</td>
                    <td className="py-3 px-4">{j.filename}</td>
                    <td className="py-3 px-4 text-secondary">{j.period ?? "—"}</td>
                    <td className="py-3 px-4">
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
