export interface DocumentTypePickerProps {
  types: readonly string[];
  selectedType: string | null;
  onSelect: (type: string) => void;
  onBack: () => void;
}
