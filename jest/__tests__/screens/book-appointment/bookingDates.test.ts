import { TIME_SLOT_STATUS } from "../../../../src/constants";
import {
  buildDateStrip,
  buildTimeSlots,
  formatMonthYear,
  toLocalDayId,
} from "../../../../src/utils";

const NOW = new Date(2026, 9, 1, 11, 10);

describe("buildTimeSlots", () => {
  it("builds ten half-hour slots from 10:00 to 2:30", () => {
    const slots = buildTimeSlots(new Date(2026, 9, 2), NOW);
    expect(slots.map((slot) => slot.id)).toEqual([
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    ]);
    expect(slots.map((slot) => slot.label)).toEqual([
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00", "1:30", "2:00", "2:30",
    ]);
  });

  it("mocks every third slot as taken on a future day and never marks selected", () => {
    const statuses = buildTimeSlots(new Date(2026, 9, 2), NOW).map((slot) => slot.status);
    const { available: a, taken: t } = TIME_SLOT_STATUS;
    expect(statuses).toEqual([a, a, t, a, a, t, a, a, t, a]);
  });

  it("marks slots at or before now as past on today", () => {
    const statuses = buildTimeSlots(new Date(2026, 9, 1), new Date(2026, 9, 1, 11, 30));
    const { available: a, taken: t, past: p } = TIME_SLOT_STATUS;
    expect(statuses.map((slot) => slot.status)).toEqual([p, p, p, p, a, t, a, a, t, a]);
  });
});

describe("buildDateStrip", () => {
  it("starts a day before the centre date and disables days before today", () => {
    const days = buildDateStrip(NOW, NOW);
    expect(days.map((day) => day.id)).toEqual([
      "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05",
    ]);
    expect(days.map((day) => day.disabled)).toEqual([true, false, false, false, false, false]);
    expect(days[1]).toMatchObject({ weekday: "Thu", dayNumber: "1" });
  });

  it("keys days by the local calendar date just after midnight", () => {
    // 00:30 local is still the previous day in UTC for any zone east of UTC (e.g. IST).
    const justAfterMidnight = new Date(2026, 9, 1, 0, 30);
    expect(buildDateStrip(justAfterMidnight, justAfterMidnight)[1].id).toBe("2026-10-01");
  });
});

describe("toLocalDayId", () => {
  it.each([
    [new Date(2026, 9, 1, 0, 5), "2026-10-01"],
    [new Date(2026, 0, 9, 23, 59), "2026-01-09"],
  ])("formats %p as %p", (date, expected) => {
    expect(toLocalDayId(date)).toBe(expected);
  });
});

describe("formatMonthYear", () => {
  it.each([
    [new Date(2026, 8, 29), "September 2026"],
    [new Date(2027, 0, 1), "January 2027"],
  ])("formats %p as %p", (date, expected) => {
    expect(formatMonthYear(date)).toBe(expected);
  });
});
