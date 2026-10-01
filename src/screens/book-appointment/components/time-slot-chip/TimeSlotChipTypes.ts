import type { TimeSlotStatus } from "../../../../types/api/bookAppointment";

export interface TimeSlotChipProps {
  label: string;
  status: TimeSlotStatus;
  onPress: () => void;
}
