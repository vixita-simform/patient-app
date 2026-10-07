import type { RefObject } from 'react';
import type { LayoutChangeEvent, TextInput, ViewStyle } from 'react-native';

import type { VisitMode } from '../../constants';
import type { DoctorProfileDetails, DoctorSummary, TimeSlot } from '../../types';
import type { DateStripDay } from '../../utils';

/** Summary from the list joined with the profile-only fee, same shape as doctor-profile. */
export interface BookAppointmentDoctorData {
  summary: DoctorSummary;
  details: DoctorProfileDetails;
}

/** State and handlers returned by `useBookAppointmentScreen`. */
export interface UseBookAppointmentScreenReturn {
  /** The looked-up doctor, or null when the id is unknown. */
  doctor: BookAppointmentDoctorData | null;
  isLoading: boolean;
  isError: boolean;
  /** "September 2026" style heading for the currently selected date's month. */
  monthLabel: string;
  selectedDate: Date;
  /** Start of the current day, used as the date picker's minimum selectable date. */
  today: Date;
  dateStripDays: readonly DateStripDay[];
  selectedDateId: string;
  /** Slots with the displayed status: the selected slot reports `selected`. */
  timeSlots: readonly TimeSlot[];
  selectedSlotId: string | null;
  selectedVisitType: VisitMode;
  reason: string;
  /** "Cardiology · ₹800" line under the doctor's name. */
  doctorSubtitle: string;
  /** "Tue, 29 Sep · 11:30 AM" footer summary, or "" until a slot is chosen. */
  summaryLabel: string;
  feeLabel: string;
  /** Bottom safe-area padding for the fixed footer. */
  footerInsetStyle: ViewStyle;
  /** Measured footer height, used as the keyboard-aware scroll's bottom offset. */
  footerHeight: number;
  /** True until a bookable slot is selected. */
  isConfirmDisabled: boolean;
  reasonInputRef: RefObject<TextInput | null>;
  /** iOS renders its date picker inline/modally in the screen; Android opens it imperatively. */
  isIosPickerVisible: boolean;
  onBackPress: () => void;
  onChangeMonthPress: () => void;
  onIosDateChange: (date: Date) => void;
  onDismissIosPicker: () => void;
  onFooterLayout: (event: LayoutChangeEvent) => void;
  onSelectDate: (id: string) => void;
  onSelectSlot: (id: string) => void;
  onSelectVisitType: (id: VisitMode) => void;
  onChangeReason: (value: string) => void;
  onConfirmPress: () => void;
}
