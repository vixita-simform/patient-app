/**
 * Range-bar "normal" band geometry, as percentages of the marker rail. Shared by
 * the band style and `useLabReportDetailScreen`'s marker maths so a value at
 * normalMin/normalMax lands exactly on the band's start/end.
 */
export const RANGE_BAND = Object.freeze({
  start: 30,
  width: 40
} as const);
