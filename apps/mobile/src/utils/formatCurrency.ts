const formatters = new Map<number, Intl.NumberFormat>();

/** Formats a number as Indian Rupees, e.g. 4350 -> "₹4,350". */
export function formatCurrency(amount: number, fractionDigits = 0): string {
  let formatter = formatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
    formatters.set(fractionDigits, formatter);
  }
  return formatter.format(amount);
}
