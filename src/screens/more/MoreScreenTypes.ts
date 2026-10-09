import type { MoreItem, MoreItemId } from "../../types";

export interface UseMoreScreenReturn {
  items: MoreItem[];
  onPressItem: (id: MoreItemId) => void;
}
