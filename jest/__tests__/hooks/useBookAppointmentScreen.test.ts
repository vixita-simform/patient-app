import { act } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { STACK_ROUTES, Strings, TIME_SLOT_STATUS, VISIT_MODE } from "../../../src/constants";
import useBookAppointmentScreen from "../../../src/screens/book-appointment/useBookAppointmentScreen";
import { formatCurrency } from "../../../src/utils";
import { RenderWrapperForHooks } from "../../Wrapper";

// Thu 1 Oct 2026, 11:10 local: 10:00-11:00 are past, 12:30 and 14:00 are mocked as taken.
const NOW = new Date(2026, 9, 1, 11, 10);

const mockedParams = jest.mocked(useLocalSearchParams);

const renderScreenHook = (id = "doc_204") => {
  mockedParams.mockReturnValue({ id });
  return RenderWrapperForHooks(() => useBookAppointmentScreen());
};

type HookResult = Awaited<ReturnType<typeof renderScreenHook>>["result"];

const statusOf = (result: HookResult, slotId: string) =>
  result.current.timeSlots.find((slot) => slot.id === slotId)?.status;

const selectedIds = (result: HookResult) =>
  result.current.timeSlots
    .filter((slot) => slot.status === TIME_SLOT_STATUS.selected)
    .map((slot) => slot.id);

describe("useBookAppointmentScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts on today with nothing selected and confirm disabled", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.selectedDateId).toBe("2026-10-01");
    expect(result.current.monthLabel).toBe("October 2026");
    expect(result.current.selectedSlotId).toBeNull();
    expect(selectedIds(result)).toEqual([]);
    expect(result.current.isConfirmDisabled).toBe(true);
    expect(result.current.summaryLabel).toBe("");
    expect(result.current.selectedVisitType).toBe(VISIT_MODE.inPerson);
  });

  it("builds the doctor subtitle and fee from the looked-up doctor", async () => {
    const { result } = await renderScreenHook();
    const fee = formatCurrency(800);
    expect(result.current.feeLabel).toBe(fee);
    expect(result.current.doctorSubtitle).toBe(
      `${result.current.doctor?.summary.specialtyLabel}${Strings.Common.dotSeparator}${fee}`,
    );
  });

  it("highlights a selected slot and enables confirm", async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    expect(result.current.selectedSlotId).toBe("11:30");
    expect(selectedIds(result)).toEqual(["11:30"]);
    expect(result.current.isConfirmDisabled).toBe(false);
    expect(result.current.summaryLabel).toBe(
      `Thu, 1 Oct${Strings.Common.dotSeparator}11:30 AM`,
    );
  });

  it("un-highlights the slot when it is tapped again", async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    await act(async () => result.current.onSelectSlot("11:30"));
    expect(result.current.selectedSlotId).toBeNull();
    expect(statusOf(result, "11:30")).toBe(TIME_SLOT_STATUS.available);
    expect(selectedIds(result)).toEqual([]);
    expect(result.current.isConfirmDisabled).toBe(true);
  });

  it("moves the highlight when another slot is chosen", async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    await act(async () => result.current.onSelectSlot("13:00"));
    expect(selectedIds(result)).toEqual(["13:00"]);
    expect(statusOf(result, "11:30")).toBe(TIME_SLOT_STATUS.available);
  });

  it.each([
    ["taken", "12:30"],
    ["past", "10:30"],
  ])("ignores a %s slot", async (status, slotId) => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    await act(async () => result.current.onSelectSlot(slotId));
    expect(statusOf(result, slotId)).toBe(status);
    expect(result.current.selectedSlotId).toBe("11:30");
  });

  it("resets the slot and rebuilds slots when a new date is selected", async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    await act(async () => result.current.onSelectDate("2026-10-02"));
    expect(result.current.selectedDateId).toBe("2026-10-02");
    expect(result.current.selectedSlotId).toBeNull();
    expect(selectedIds(result)).toEqual([]);
    // Not today any more, so the morning slots are bookable again.
    expect(statusOf(result, "10:00")).toBe(TIME_SLOT_STATUS.available);
  });

  it("ignores a disabled (past) day in the strip", async () => {
    const { result } = await renderScreenHook();
    expect(result.current.dateStripDays[0]).toMatchObject({ id: "2026-09-30", disabled: true });
    await act(async () => result.current.onSelectDate("2026-09-30"));
    expect(result.current.selectedDateId).toBe("2026-10-01");
  });

  it("resets the slot when the iOS picker confirms a date", async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSelectSlot("11:30"));
    await act(async () => result.current.onIosDateChange(new Date(2026, 10, 15)));
    expect(result.current.selectedDateId).toBe("2026-11-15");
    expect(result.current.monthLabel).toBe("November 2026");
    expect(result.current.selectedSlotId).toBeNull();
    expect(result.current.isIosPickerVisible).toBe(false);
  });

  it("keeps the doctor id when falling back from back navigation", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await renderScreenHook("doc_204");
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith({
      pathname: STACK_ROUTES.doctorProfile,
      params: { id: "doc_204" },
    });
    expect(router.back).not.toHaveBeenCalled();
  });

  it("returns null for an unknown doctor", async () => {
    const { result } = await renderScreenHook("doc_missing");
    expect(result.current.doctor).toBeNull();
    expect(result.current.doctorSubtitle).toBe("");
  });
});
