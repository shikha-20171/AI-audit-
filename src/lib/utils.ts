export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function clampMinimum(value: number, minimum = 0) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, value);
}

export function safeRound(value: number) {
  return Math.round(value * 100) / 100;
}

export function slugId() {
  return crypto.randomUUID().slice(0, 8);
}
