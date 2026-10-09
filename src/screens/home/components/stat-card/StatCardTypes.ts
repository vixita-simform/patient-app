export interface StatCardProps {
  label: string;
  value: number;
  caption: string;
  colors: readonly [string, string];
  onPress: () => void;
}
