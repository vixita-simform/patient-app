export interface ChipProps<T extends string = string> {
  id: T;
  label: string;
  selected: boolean;
  onPress: (id: T) => void;
}
