export const BUTTON_VARIANT = {
  fill: "fill",
  line: "line",
} as const;

export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

/** My Appointments: the 3 segmented tabs. */
export const APPOINTMENT_TAB = {
  upcoming: "upcoming",
  completed: "completed",
  cancelled: "cancelled",
} as const;

export type AppointmentTab = (typeof APPOINTMENT_TAB)[keyof typeof APPOINTMENT_TAB];

/** My Appointments: badge/status per appointment. */
export const APPOINTMENT_STATUS = {
  confirmed: "confirmed",
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

/** My Appointments: visit mode drives the sub-title suffix and action pair. */
export const VISIT_MODE = {
  inPerson: "inPerson",
  video: "video",
} as const;

export type VisitMode = (typeof VISIT_MODE)[keyof typeof VISIT_MODE];

/** Records: each record row's icon-tint category. */
export const RECORD_TYPE = {
  labReport: "labReport",
  scan: "scan",
  prescription: "prescription",
  discharge: "discharge",
} as const;

export type RecordType = (typeof RECORD_TYPE)[keyof typeof RECORD_TYPE];

/** Medicines: today's-doses strip, per-dose chip state. */
export const DOSE_STATUS = {
  done: "done",
  next: "next",
  pending: "pending",
} as const;

export type DoseStatus = (typeof DOSE_STATUS)[keyof typeof DOSE_STATUS];

/** Notifications: per-row category, drives the tinted icon box + icon. */
export const NOTIFICATION_TYPE = {
  queueUpdate: "queueUpdate",
  labReport: "labReport",
  medicine: "medicine",
  appointment: "appointment",
  billing: "billing",
  insurance: "insurance",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** Records: the 3 summary-strip tile ids. Only `prescriptions` has a navigation target. */
export const RECORD_SUMMARY_TILE_ID = {
  labReports: "labReports",
  prescriptions: "prescriptions",
  discharges: "discharges",
} as const;

export type RecordSummaryTileId =
  (typeof RECORD_SUMMARY_TILE_ID)[keyof typeof RECORD_SUMMARY_TILE_ID];
