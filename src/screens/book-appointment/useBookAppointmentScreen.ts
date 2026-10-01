import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent, TextInput, ViewStyle } from "react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  findADoctorDummyData,
  getDoctorProfileDetails,
  STACK_ROUTES,
  Strings,
  TIME_SLOT_STATUS,
  VISIT_MODE,
  type VisitMode,
} from "../../constants";
import { scale } from "../../theme";
import type { TimeSlot } from "../../types";
import {
  buildDateStrip,
  buildTimeSlots,
  formatCurrency,
  formatDate,
  formatMonthYear,
  formatTime,
  startOfDay,
  toLocalDayId,
} from "../../utils";
import type {
  BookAppointmentDoctorData,
  UseBookAppointmentScreenReturn,
} from "./BookAppointmentScreenTypes";

/** Matches `footerBar`'s paddingBottom in BookAppointmentScreenStyles. */
const FOOTER_BOTTOM_BASE = 14;

/**
 * State and handlers for the Book appointment screen.
 * @returns {UseBookAppointmentScreenReturn} doctor lookup, date/slot/visit-type/reason
 * selection state, and the handlers the screen renders against.
 */
export default function useBookAppointmentScreen(): UseBookAppointmentScreenReturn {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { bottom } = useSafeAreaInsets();
  const reasonInputRef = useRef<TextInput>(null);

  // Mock request state: the static data never loads or fails.
  const isLoading = false;
  const isError = false;

  const doctor = useMemo<BookAppointmentDoctorData | null>(() => {
    const details = id ? getDoctorProfileDetails(id) : undefined;
    const summary = findADoctorDummyData.doctors.find((item) => item.id === id);
    return summary && details ? { summary, details } : null;
  }, [id]);

  // Re-read on every date change so "today" and past slots don't go stale across midnight.
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(now));
  // Single source of truth for the selection; slot statuses never store "selected".
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitMode>(
    VISIT_MODE.inPerson,
  );
  const [reason, setReason] = useState("");
  const [footerHeight, setFooterHeight] = useState(0);
  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);

  const today = useMemo(() => startOfDay(now), [now]);
  const baseSlots = useMemo(
    () => buildTimeSlots(selectedDate, now),
    [selectedDate, now],
  );
  const isSlotSelected = baseSlots.some(
    (slot) =>
      slot.id === selectedSlotId && slot.status === TIME_SLOT_STATUS.available,
  );
  const timeSlots = useMemo<TimeSlot[]>(
    () =>
      baseSlots.map((slot) =>
        slot.id === selectedSlotId && slot.status === TIME_SLOT_STATUS.available
          ? { ...slot, status: TIME_SLOT_STATUS.selected }
          : slot,
      ),
    [baseSlots, selectedSlotId],
  );

  const dateStripDays = useMemo(
    () => buildDateStrip(selectedDate, today),
    [selectedDate, today],
  );
  const selectedDateId = toLocalDayId(selectedDate);
  const monthLabel = useMemo(() => formatMonthYear(selectedDate), [selectedDate]);

  const footerInsetStyle = useMemo<ViewStyle>(
    // Keep the footer's own bottom padding and add the safe-area inset on top of it.
    () => ({ paddingBottom: scale(FOOTER_BOTTOM_BASE) + bottom }),
    [bottom],
  );

  const summaryLabel = useMemo(() => {
    if (!selectedSlotId || !isSlotSelected) {
      return "";
    }
    const [hour, minute] = selectedSlotId.split(":").map(Number);
    const withTime = new Date(selectedDate);
    withTime.setHours(hour, minute, 0, 0);
    return `${formatDate(selectedDate)}${Strings.Common.dotSeparator}${formatTime(withTime)}`;
  }, [selectedDate, selectedSlotId, isSlotSelected]);

  const feeLabel = useMemo(
    () => (doctor ? formatCurrency(doctor.details.consultationFee) : ""),
    [doctor],
  );
  const doctorSubtitle = doctor
    ? `${doctor.summary.specialtyLabel}${Strings.Common.dotSeparator}${feeLabel}`
    : "";

  const onBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: STACK_ROUTES.doctorProfile, params: { id } });
    }
  }, [id]);

  /** Opens the native date picker: Android's imperative API, iOS's inline/modal component. */
  const onChangeMonthPress = useCallback(() => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: "date",
        display: "calendar",
        minimumDate: today,
        onChange: (_event, date) => {
          if (date) {
            setNow(new Date());
            setSelectedDate(startOfDay(date));
            setSelectedSlotId(null);
          }
        },
      });
      return;
    }
    setIsIosPickerVisible(true);
  }, [selectedDate, today]);

  const onIosDateChange = useCallback((date: Date) => {
    setIsIosPickerVisible(false);
    setNow(new Date());
    setSelectedDate(startOfDay(date));
    setSelectedSlotId(null);
  }, []);

  const onDismissIosPicker = useCallback(() => {
    setIsIosPickerVisible(false);
  }, []);

  const onSelectDate = useCallback(
    (dayId: string) => {
      const match = dateStripDays.find((day) => day.id === dayId);
      if (match && !match.disabled) {
        setNow(new Date());
        setSelectedDate(match.date);
        setSelectedSlotId(null);
      }
    },
    [dateStripDays],
  );

  const onSelectSlot = useCallback(
    (slotId: string) => {
      const target = baseSlots.find((slot) => slot.id === slotId);
      if (target?.status !== TIME_SLOT_STATUS.available) {
        return;
      }
      setSelectedSlotId((current) => (current === slotId ? null : slotId));
    },
    [baseSlots],
  );

  const onSelectVisitType = useCallback((visitType: VisitMode) => {
    setSelectedVisitType(visitType);
  }, []);

  const onChangeReason = useCallback((value: string) => {
    setReason(value);
  }, []);

  const onFooterLayout = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  }, []);

  // TODO: pending the booking API (request + success screen). Until then the confirm
  // button stays disabled without a selected slot, and pressing it does nothing.
  const onConfirmPress = useCallback(() => {}, []);

  return {
    doctor,
    isLoading,
    isError,
    monthLabel,
    selectedDate,
    today,
    dateStripDays,
    selectedDateId,
    timeSlots,
    selectedSlotId: isSlotSelected ? selectedSlotId : null,
    selectedVisitType,
    reason,
    doctorSubtitle,
    summaryLabel,
    feeLabel,
    footerInsetStyle,
    footerHeight,
    isConfirmDisabled: !isSlotSelected,
    reasonInputRef,
    isIosPickerVisible,
    onBackPress,
    onChangeMonthPress,
    onIosDateChange,
    onDismissIosPicker,
    onFooterLayout,
    onSelectDate,
    onSelectSlot,
    onSelectVisitType,
    onChangeReason,
    onConfirmPress,
  };
}
