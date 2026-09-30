/** e.g. "Dr. Rohan Mehta" -> "RM"; ignores honorifics like "Dr." */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith('.'))
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
