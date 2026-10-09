import type { MoreItem, MoreItemId } from "../../../../types";

export interface MoreItemRowProps {
  item: MoreItem;
  onPress: (id: MoreItemId) => void;
}
