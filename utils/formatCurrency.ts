export function formatCurrency(amount: number, currency: string = "NPR"): string {
  return `Nrs ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
