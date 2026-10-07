import type { AppointmentTab } from '../../constants';
import type { AppointmentCardProps } from './components';
import type { SegmentedTabItem } from '../../components';

/** One row for the appointments FlatList. */
export type AppointmentListItem = AppointmentCardProps & { id: string };

export interface UseMyAppointmentsScreenReturn {
  tabs: readonly SegmentedTabItem<AppointmentTab>[];
  activeTab: AppointmentTab;
  listData: readonly AppointmentListItem[];
  isLoading: boolean;
  isError: boolean;
  onTabPress: (id: AppointmentTab) => void;
  onPressAdd: () => void;
}
