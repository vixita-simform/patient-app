import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TextInput, ViewStyle } from "react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  findADoctorDummyData,
  getDoctorProfileDetails,
  STACK_ROUTES,
  VISIT_MODE,
} from "../../constants";
import type {
  DateStripDay,
  TimeSlot,
  VisitTypeId,
} from "../../types/api/bookAppointment";
import { formatCurrency, formatDate, formatTime, WEEKDAYS } from "../../utils";
import type {
  BookAppointmentDoctorData,
  UseBookAppointmentScreenReturn,
} from "./BookAppointmentScreenTypes";

/** Number of days shown in the horizontal date strip, centred a day before "today". */
const DATE_STRIP_DAYS = 6;
const DATE_STRIP_LEAD_DAYS = 1;
/** Booked-slot mock: every 3rd slot renders as taken, since there is no backend yet. */
const TAKEN_SLOT_INTERVAL = 3;
/** 30-minute slots, 10:00 AM through the last bookable start at 2:30 PM. */
const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 15;
const SLOT_STEP_MINUTES = 30;

/** Builds the 10:00-2:30 half-hour slot list, mocking every 3rd slot as taken and marking
 * any slot at or before `now` as past when `date` is today. */
function buildTimeSlots(date: Date, now: Date): TimeSlot[] {
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: TimeSlot[] = [];
  let index = 0;
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      const totalMinutes = hour * 60 + minute;
      if (totalMinutes >= SLOT_END_HOUR * 60) {
        break;
      }
      const displayHour = hour % 12 || 12;
      const label = `${displayHour}:${String(minute).padStart(2, "0")}`;
      const isPast = isToday && totalMinutes <= nowMinutes;
      const status: TimeSlot["status"] = isPast
        ? "past"
        : (index + 1) % TAKEN_SLOT_INTERVAL === 0
          ? "taken"
          : "available";
      slots.push({
        id: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        label,
        status,
      });
      index += 1;
    }
  }
  return slots;
}

/** Builds the horizontal date strip: `DATE_STRIP_LEAD_DAYS` before `centerDate`, rest after. */
function buildDateStrip(centerDate: Date, today: Date): DateStripDay[] {
  const start = new Date(centerDate);
  start.setDate(start.getDate() - DATE_STRIP_LEAD_DAYS);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Array.from({ length: DATE_STRIP_DAYS }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return {
      id: date.toISOString().slice(0, 10),
      weekday: WEEKDAYS[date.getDay()],
      dayNumber: String(date.getDate()),
      disabled: dateStart < todayStart,
      date,
    };
  });
}

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

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() =>
    buildTimeSlots(today, today),
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedVisitType, setSelectedVisitType] =
    useState<VisitTypeId>(VISIT_MODE.inPerson);
  const [reason, setReason] = useState("");

  const dateStripDays = useMemo(
    () => buildDateStrip(selectedDate, today),
    [selectedDate, today],
  );
  const selectedDateId = selectedDate.toISOString().slice(0, 10);

  const monthLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [selectedDate],
  );

  const footerInsetStyle = useMemo<ViewStyle>(
    () => ({ paddingBottom: bottom }),
    [bottom],
  );

  const summaryLabel = useMemo(() => {
    if (!selectedSlotId) {
      return "";
    }
    const [hour, minute] = selectedSlotId.split(":").map(Number);
    const withTime = new Date(selectedDate);
    withTime.setHours(hour, minute, 0, 0);
    return `${formatDate(selectedDate)} · ${formatTime(withTime)}`;
  }, [selectedDate, selectedSlotId]);

  const feeLabel = useMemo(
    () => (doctor ? formatCurrency(doctor.details.consultationFee) : ""),
    [doctor],
  );

  const onBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(STACK_ROUTES.doctorProfile);
    }
  }, []);

  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);

  const onDatePicked = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setSelectedSlotId(null);
      setTimeSlots(buildTimeSlots(date, today));
    },
    [today],
  );

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
            onDatePicked(date);
          }
        },
      });
      return;
    }
    setIsIosPickerVisible(true);
  }, [onDatePicked, selectedDate, today]);

  const onIosDateChange = useCallback(
    (_event: unknown, date?: Date) => {
      setIsIosPickerVisible(false);
      if (date) {
        onDatePicked(date);
      }
    },
    [onDatePicked],
  );

  const onDismissIosPicker = useCallback(() => {
    setIsIosPickerVisible(false);
  }, []);

  const onSelectDate = useCallback(
    (dayId: string) => {
      const match = dateStripDays.find((day) => day.id === dayId);
      if (match && !match.disabled) {
        setSelectedDate(match.date);
        setSelectedSlotId(null);
        setTimeSlots(buildTimeSlots(match.date, today));
      }
    },
    [dateStripDays, today],
  );

  const onSelectSlot = useCallback(
    (slotId: string) => {
      setTimeSlots((current) =>
        current.map((slot) => {
          if (slot.status === "taken" || slot.status === "past") {
            return slot;
          }
          if (slot.id === slotId) {
            return { ...slot, status: "selected" };
          }
          return slot.status === "selected"
            ? { ...slot, status: "available" }
            : slot;
        }),
      );
      setSelectedSlotId((current) => {
        const target = current === slotId ? null : slotId;
        if (target) {
          const targetSlot = timeSlots.find((slot) => slot.id === target);
          if (
            targetSlot &&
            (targetSlot.status === "taken" || targetSlot.status === "past")
          ) {
            return current;
          }
        }
        return target;
      });
    },
    [timeSlots],
  );

  const onSelectVisitType = useCallback((visitType: VisitTypeId) => {
    setSelectedVisitType(visitType);
  }, []);

  const onChangeReason = useCallback((value: string) => {
    setReason(value);
  }, []);

  // TODO: booking confirmation flow (API call / success screen) not built yet.
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
    selectedSlotId,
    selectedVisitType,
    reason,
    summaryLabel,
    feeLabel,
    footerInsetStyle,
    reasonInputRef,
    isIosPickerVisible,
    onBackPress,
    onChangeMonthPress,
    onIosDateChange,
    onDismissIosPicker,
    onSelectDate,
    onSelectSlot,
    onSelectVisitType,
    onChangeReason,
    onConfirmPress,
  };
}
