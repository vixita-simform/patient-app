export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: string;
}

export interface SegmentedTabsProps<T extends string = string> {
  items: readonly SegmentedTabItem<T>[];
  activeId: T;
  onPress: (id: T) => void;
}
