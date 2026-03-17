import { useMemo, useState } from "react";
import { uploadImports, type UploadManyResult } from "../../api/imports";

export function CsvUpload({
  onUploaded,
}: {
  onUploaded?: (result: UploadManyResult) => void | Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (files.length === 0) return "Keine Datei ausgewählt";
    if (files.length === 1) return files[0].name;
    return `${files.length} Dateien ausgewählt`;
  }, [files]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected);
    setError(null);
    setSuccess(null);
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("Bitte mindestens eine CSV-Datei auswählen.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const result = await uploadImports(files);

      setSuccess(
        result.count === 1
          ? `1 Datei erfolgreich importiert.`
          : `${result.count} Dateien erfolgreich importiert.`,
      );
      setFiles([]);

      const input = document.getElementById("csv-upload-input") as HTMLInputElement | null;
      if (input) input.value = "";

      await onUploaded?.(result);
    } catch (e: any) {
      setError(e?.message ?? "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          htmlFor="csv-upload-input"
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-primary transition hover:bg-accent-soft"
        >
          CSV-Dateien auswählen
        </label>

        <input
          id="csv-upload-input"
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Import läuft…" : files.length <= 1 ? "Datei importieren" : "Dateien importieren"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-secondary">
        {fileLabel}
      </div>

      {files.length > 0 ? (
        <div className="rounded-xl border border-border/60 bg-bg/40 p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-secondary">
            Ausgewählte Dateien
          </div>
          <ul className="space-y-1 text-sm text-primary">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-success/30 bg-green-50 px-4 py-3 text-sm text-success">
          {success}
        </div>
      ) : null}
    </div>
  );
}