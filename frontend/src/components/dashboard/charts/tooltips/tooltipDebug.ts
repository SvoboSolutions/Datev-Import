export function debugTooltip(title: string, items: any[]) {
  // Nur 1x pro Hover, sonst nervt es
  // Du kannst es später wieder entfernen
  // eslint-disable-next-line no-console
  console.log("TOOLTIP TITLE:", title);
  // eslint-disable-next-line no-console
  console.log("TOOLTIP ITEMS:", items);
}
