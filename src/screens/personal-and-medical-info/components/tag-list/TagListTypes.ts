import type { ChipOption } from "../chip-group/ChipGroupTypes";

export interface TagListProps {
  tags: readonly ChipOption[];
  addLabel: string;
  removeLabel: string;
  onRemove: (id: string) => void;
  onAdd: () => void;
}
