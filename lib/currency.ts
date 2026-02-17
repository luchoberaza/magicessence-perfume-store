const formatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "UYU",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatUYU(cents: number): string {
  return formatter.format(cents)
}
