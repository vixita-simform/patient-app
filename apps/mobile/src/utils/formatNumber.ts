const formatter = new Intl.NumberFormat('en-IN');

/** Formats a plain number with Indian digit grouping, e.g. 74000 -> "74,000". */
export function formatNumber(value: number): string {
  return formatter.format(value);
}
