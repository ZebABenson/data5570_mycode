export function fmtCurrency(n: number, maximumFractionDigits = 0): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}

export function fmtNumber(n: number, maximumFractionDigits = 0): string {
  return n.toLocaleString(undefined, { maximumFractionDigits });
}

export function fmtPercent(fraction: number, maximumFractionDigits = 0): string {
  return (fraction * 100).toLocaleString(undefined, { maximumFractionDigits }) + "%";
}

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
