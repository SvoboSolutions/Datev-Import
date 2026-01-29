import { useState } from "react";

export function AccordionSection({
  title,
  subtitle,
  defaultOpen = true,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  right?: React.ReactNode; // z.B. Dropdown/Buttons
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3"
      >
        <div className="text-left">
          <div className="text-base font-semibold text-primary">{title}</div>
          {subtitle && <div className="text-sm text-secondary mt-0.5">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-3">
          {right}
          <span
            className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border text-secondary transition ${
              open ? "bg-accent-soft" : "bg-bg"
            }`}
            aria-hidden
          >
            {open ? "▾" : "▸"}
          </span>
        </div>
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
