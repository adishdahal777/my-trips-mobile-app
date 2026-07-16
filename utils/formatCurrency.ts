export function formatCurrency(amount: number, currency: string = "NPR"): string {
  return `Rs ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
