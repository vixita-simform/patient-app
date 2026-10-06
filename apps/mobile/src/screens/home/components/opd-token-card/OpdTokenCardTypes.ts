export interface OpdTokenCardProps {
  department: string;
  tokenNumber: string;
  servingNumber: string;
  patientsAhead: number;
  waitMinutes: number;
  /** Queue progress, 0 to 1 */
  progress: number;
}
