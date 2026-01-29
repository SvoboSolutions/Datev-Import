import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  );
}
