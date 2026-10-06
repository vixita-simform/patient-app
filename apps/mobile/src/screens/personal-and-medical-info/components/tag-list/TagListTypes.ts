import type { ChipOption } from "../chip-group/ChipGroupTypes";

export interface TagListProps {
  tags: readonly ChipOption[];
  addLabel: string;
  removeLabel: string;
  onRemove: (id: string) => void;
  /** Omitted until there is a way to enter a new tag; the add chip then renders disabled. */
  onAdd?: () => void;
}
