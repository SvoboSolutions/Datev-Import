import { formatEuro } from "../../utils/format";

export function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;

  const s = String(v).trim();
  if (!s) return 0;

  const norm = s.replace(/\./g, "").replace(",", ".");
  const n = Number(norm);
  return Number.isFinite(n) ? n : 0;
}

export function money(v: any) {
  return formatEuro(toNumber(v));
}

export function periodLabel(p: string) {
  const [y, m] = String(p).split("-");
  return m && y ? `${m}.${y}` : String(p);
}
