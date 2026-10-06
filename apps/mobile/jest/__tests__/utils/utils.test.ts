import {
  formatCurrency,
  formatDate,
  formatDateWithYear,
  formatTime,
  getInitials,
  isThisWeek,
  isToday,
  isYesterday,
  WEEKDAYS,
} from "../../../src/utils";

describe("formatDate", () => {
  it("formats a valid date", () => {
    expect(formatDate(new Date(2026, 8, 29, 11, 30))).toBe("Tue, 29 Sep");
    expect(formatDate("2026-01-04T08:00:00")).toBe("Sun, 4 Jan");
  });

  it.each(["not a date", Number.NaN, new Date("invalid")])(
    "returns an empty string for %p",
    (value) => {
      expect(formatDate(value)).toBe("");
    },
  );
});

describe("formatTime", () => {
  it.each([
    [new Date(2026, 8, 29, 11, 30), "11:30 AM"],
    [new Date(2026, 8, 29, 0, 5), "12:05 AM"],
    [new Date(2026, 8, 29, 12, 0), "12:00 PM"],
    [new Date(2026, 8, 29, 23, 59), "11:59 PM"],
  ])("formats %p as %p", (value, expected) => {
    expect(formatTime(value)).toBe(expected);
  });

  it.each(["", "garbage", new Date(Number.NaN)])("returns an empty string for %p", (value) => {
    expect(formatTime(value)).toBe("");
  });
});

describe("isToday", () => {
  const now = new Date(2026, 8, 29, 9, 0);

  it("is true on the same calendar day", () => {
    expect(isToday(new Date(2026, 8, 29, 23, 0), now)).toBe(true);
  });

  it("is false on another day or for an invalid date", () => {
    expect(isToday(new Date(2026, 8, 30, 0, 0), now)).toBe(false);
    expect(isToday("invalid", now)).toBe(false);
  });
});

describe("formatDateWithYear", () => {
  it("formats a valid date with its year", () => {
    expect(formatDateWithYear(new Date(1992, 2, 14))).toBe("14 Mar 1992");
    expect(formatDateWithYear("2026-12-01T08:00:00")).toBe("1 Dec 2026");
  });

  it.each(["not a date", Number.NaN, new Date("invalid")])(
    "returns an empty string for %p",
    (value) => {
      expect(formatDateWithYear(value)).toBe("");
    },
  );
});

describe("isYesterday", () => {
  const now = new Date(2026, 9, 1, 9, 0);

  it("is true anywhere on the previous calendar day", () => {
    expect(isYesterday(new Date(2026, 8, 30, 0, 0), now)).toBe(true);
    expect(isYesterday(new Date(2026, 8, 30, 23, 59), now)).toBe(true);
  });

  it("is false for today, two days ago, tomorrow or an invalid date", () => {
    expect(isYesterday(new Date(2026, 9, 1, 0, 0), now)).toBe(false);
    expect(isYesterday(new Date(2026, 8, 29, 23, 59), now)).toBe(false);
    expect(isYesterday(new Date(2026, 9, 2, 9, 0), now)).toBe(false);
    expect(isYesterday("invalid", now)).toBe(false);
  });
});

describe("isThisWeek", () => {
  const now = new Date(2026, 9, 8, 9, 0);

  it("is true from two to seven calendar days ago", () => {
    expect(isThisWeek(new Date(2026, 9, 6, 12, 0), now)).toBe(true);
    // 7-day boundary: the very start of the day a week ago still counts.
    expect(isThisWeek(new Date(2026, 9, 1, 0, 0), now)).toBe(true);
  });

  it("is false just before the 7-day boundary", () => {
    expect(isThisWeek(new Date(2026, 8, 30, 23, 59), now)).toBe(false);
  });

  it("is false for today and yesterday", () => {
    expect(isThisWeek(new Date(2026, 9, 8, 8, 0), now)).toBe(false);
    expect(isThisWeek(new Date(2026, 9, 7, 8, 0), now)).toBe(false);
  });

  it("is false for a future date", () => {
    expect(isThisWeek(new Date(2026, 9, 10, 9, 0), now)).toBe(false);
  });

  it.each(["invalid", Number.NaN, new Date("invalid")])("is false for %p", (value) => {
    expect(isThisWeek(value, now)).toBe(false);
  });
});

describe("WEEKDAYS", () => {
  it("is frozen", () => {
    expect(Object.isFrozen(WEEKDAYS)).toBe(true);
  });
});

describe("formatCurrency", () => {
  it("formats rupees with Indian grouping and no decimals by default", () => {
    expect(formatCurrency(800)).toBe("₹800");
    expect(formatCurrency(4350)).toBe("₹4,350");
    expect(formatCurrency(1234567)).toBe("₹12,34,567");
  });

  it("honours the fraction digits argument", () => {
    expect(formatCurrency(1234.5, 2)).toBe("₹1,234.50");
    expect(formatCurrency(1234.5)).toBe("₹1,235");
  });
});

describe("getInitials", () => {
  it.each([
    ["Dr. Rohan Mehta", "RM"],
    ["Aarav Patel", "AP"],
    ["sneha kapoor", "SK"],
    ["Madonna", "M"],
    ["Anna Maria Lopez", "AM"],
    ["  Dr.   Vikram   Desai  ", "VD"],
    ["", ""],
  ])("%p -> %p", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
