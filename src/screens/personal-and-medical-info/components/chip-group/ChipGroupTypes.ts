export interface ChipOption {
  id: string;
  label: string;
}

export interface ChipGroupProps {
  options: readonly ChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}
