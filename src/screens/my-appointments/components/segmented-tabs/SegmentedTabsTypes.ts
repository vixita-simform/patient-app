import type { AppointmentTab } from "../../../../constants";

export interface SegmentedTabItem {
  id: AppointmentTab;
  label: string;
}

export interface SegmentedTabsProps {
  items: readonly SegmentedTabItem[];
  activeId: AppointmentTab;
  onPress: (id: AppointmentTab) => void;
}
