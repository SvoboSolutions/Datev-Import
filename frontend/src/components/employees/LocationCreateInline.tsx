import { useState } from "react";

export function LocationCreateInline({
  onCreate,
  loading,
}: {
  onCreate: (name: string) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Bitte einen Standortnamen eingeben.");
      return;
    }

    try {
      setError(null);
      await onCreate(trimmed);
      setName("");
      setOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Standort konnte nicht angelegt werden");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="text-sm rounded-lg border border-border px-3 py-2 hover:bg-accent-soft"
      >
        + Standort hinzufügen
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3 space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Neuer Standortname"
        className="w-full rounded-xl border border-border bg-bg/60 px-3 py-2.5 text-sm text-primary outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/50"
      />

      {error ? <div className="text-sm text-error">{error}</div> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-accent/30 bg-accent/15 px-3 py-2 text-sm font-medium text-primary transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Anlegen ..." : "Standort anlegen"}
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setName("");
            setError(null);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium text-primary transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}