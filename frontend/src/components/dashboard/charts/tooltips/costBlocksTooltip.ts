import { money, periodLabel, toNumber } from "../../../charts/formatters";

function pickValue(it: any): number {
  // In 2.6.7 ist value oft NICHT gesetzt, data enthält alles
  const d = it?.data ?? {};
  const raw =
    it?.value ??
    d.value ??
    d.y ??
    d[ d.yField ?? "value" ] ??
    d[ "value" ];

  return toNumber(raw);
}

function pickName(it: any): string {
  const d = it?.data ?? {};
  return it?.name ?? d.type ?? d.name ?? "Wert";
}

export function costBlocksTooltipHtml(title: string, items: any[]) {
  const t = periodLabel(title);

  const rows = (items ?? []).map((it: any) => ({
    name: pickName(it),
    value: pickValue(it),
  }));

  rows.sort((a, b) => b.value - a.value);
  const sum = rows.reduce((acc, r) => acc + r.value, 0);

  const body = rows
    .map(
      (r) => `<div style="display:flex;justify-content:space-between;gap:12px;">
        <span>${r.name}</span><b>${money(r.value)}</b>
      </div>`
    )
    .join("");

  return `<div style="padding:10px 12px;min-width:240px;">
    <div style="font-weight:700;margin-bottom:8px;">${t}</div>
    <div style="display:flex;flex-direction:column;gap:6px;">${body}</div>
    <div style="height:1px;background:rgba(0,0,0,0.08);margin:10px 0;"></div>
    <div style="display:flex;justify-content:space-between;">
      <span><b>Summe</b></span><b>${money(sum)}</b>
    </div>
  </div>`;
}
