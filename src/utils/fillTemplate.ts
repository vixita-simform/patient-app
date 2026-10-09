/** e.g. fillTemplate("Showing {shown} of {total}", { shown: 4, total: 11 }) -> "Showing 4 of 11" */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
