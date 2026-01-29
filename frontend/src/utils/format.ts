export function formatEuro(value: number | null | undefined): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "–";
  }

  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
