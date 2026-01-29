import { useRef, useState } from "react";
import { uploadImport } from "../../api/imports";

export function CsvUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setOk(null);
    const f = e.target.files?.[0];
    setFileName(f?.name ?? "");
  }

  async function onUpload() {
    setError(null);
    setOk(null);

    const f = inputRef.current?.files?.[0];
    if (!f) {
      setError("Bitte eine CSV-Datei auswählen.");
      return;
    }
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Nur CSV-Dateien sind erlaubt.");
      return;
    }

    try {
      setBusy(true);
      const res = await uploadImport(f);
      setOk(`Import gestartet: ${res.filename} (${res.period ?? "—"})`);
      // reset input
      if (inputRef.current) inputRef.current.value = "";
      setFileName("");
    } catch (e: any) {
      setError(e?.message ?? "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium text-secondary mb-2">
          Datei auswählen
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onPickFile}
            className="block w-full text-sm
              file:mr-3 file:rounded-lg file:border-0
              file:bg-accent file:text-white
              file:px-4 file:py-2
              file:hover:bg-accent-hover
              file:transition
              text-secondary"
          />

          <button
            onClick={onUpload}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
              bg-accent text-white hover:bg-accent-hover transition
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Lädt…" : "Upload starten"}
          </button>
        </div>

        {fileName && (
          <div className="mt-2 text-xs text-muted">
            Ausgewählt: {fileName}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-red-50 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {ok && (
        <div className="rounded-lg border border-success bg-green-50 px-3 py-2 text-sm text-success">
          {ok}
        </div>
      )}
    </div>
  );
}
