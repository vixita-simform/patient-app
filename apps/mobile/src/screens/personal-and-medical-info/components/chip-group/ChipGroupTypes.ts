export interface ChipOption<T extends string = string> {
  id: T;
  label: string;
}

export interface ChipGroupProps<T extends string = string> {
  options: readonly ChipOption<T>[];
  selectedId: T | null;
  onSelect: (id: T) => void;
}
