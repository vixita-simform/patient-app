import type { PatientBloodGroup, PatientGender } from '@patient-app/shared-types';

export const BUTTON_VARIANT = {
  fill: 'fill',
  line: 'line'
} as const;

export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

/** My Appointments: the 3 segmented tabs. */
export const APPOINTMENT_TAB = {
  upcoming: 'upcoming',
  completed: 'completed',
  cancelled: 'cancelled'
} as const;

export type AppointmentTab = (typeof APPOINTMENT_TAB)[keyof typeof APPOINTMENT_TAB];

/** My Appointments: badge/status per appointment. */
export const APPOINTMENT_STATUS = {
  confirmed: 'confirmed',
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled'
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

/** My Appointments: visit mode drives the sub-title suffix and action pair. */
export const VISIT_MODE = {
  inPerson: 'inPerson',
  video: 'video'
} as const;

export type VisitMode = (typeof VISIT_MODE)[keyof typeof VISIT_MODE];

/** Records: each record row's icon-tint category. */
export const RECORD_TYPE = {
  labReport: 'labReport',
  scan: 'scan',
  prescription: 'prescription',
  discharge: 'discharge'
} as const;

export type RecordType = (typeof RECORD_TYPE)[keyof typeof RECORD_TYPE];

/** Medicines: today's-doses strip, per-dose chip state. */
export const DOSE_STATUS = {
  done: 'done',
  next: 'next',
  pending: 'pending'
} as const;

export type DoseStatus = (typeof DOSE_STATUS)[keyof typeof DOSE_STATUS];

/** Notifications: per-row category, drives the tinted icon box + icon. */
export const NOTIFICATION_TYPE = {
  queueUpdate: 'queueUpdate',
  labReport: 'labReport',
  medicine: 'medicine',
  appointment: 'appointment',
  billing: 'billing',
  insurance: 'insurance'
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** Records: the 3 summary-strip tile ids. Only `prescriptions` has a navigation target. */
export const RECORD_SUMMARY_TILE_ID = {
  labReports: 'labReports',
  prescriptions: 'prescriptions',
  discharges: 'discharges'
} as const;

export type RecordSummaryTileId =
  (typeof RECORD_SUMMARY_TILE_ID)[keyof typeof RECORD_SUMMARY_TILE_ID];

/** Profile: the 6 menu-row ids. */
export const PROFILE_MENU_ID = {
  personalInfo: 'personalInfo',
  familyMembers: 'familyMembers',
  insurance: 'insurance',
  vitalsHistory: 'vitalsHistory',
  settings: 'settings',
  help: 'help'
} as const;

export type ProfileMenuId = (typeof PROFILE_MENU_ID)[keyof typeof PROFILE_MENU_ID];

/** Profile: menu-row icon-box tint. */
export const PROFILE_MENU_TONE = {
  green: 'green',
  blue: 'blue',
  amber: 'amber'
} as const;

export type ProfileMenuTone = (typeof PROFILE_MENU_TONE)[keyof typeof PROFILE_MENU_TONE];

/** Personal & medical info: gender options, in display order. */
export const GENDER = {
  male: 'male',
  female: 'female',
  other: 'other'
} as const satisfies Record<string, PatientGender>;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

/** Personal & medical info: the 8 blood groups, in display order. */
export const BLOOD_GROUP = {
  aPositive: 'A+',
  aNegative: 'A-',
  bPositive: 'B+',
  bNegative: 'B-',
  oPositive: 'O+',
  oNegative: 'O-',
  abPositive: 'AB+',
  abNegative: 'AB-'
} as const satisfies Record<string, PatientBloodGroup>;

export type BloodGroup = (typeof BLOOD_GROUP)[keyof typeof BLOOD_GROUP];

/** Sign in: the two identifier tabs. */
export const AUTH_TAB = {
  mobile: 'mobile',
  patientId: 'patientId'
} as const;

export type AuthTab = (typeof AUTH_TAB)[keyof typeof AUTH_TAB];

/** Sign in: request an OTP, or use a password. */
export const AUTH_METHOD = {
  otp: 'otp',
  password: 'password'
} as const;

export type AuthMethod = (typeof AUTH_METHOD)[keyof typeof AUTH_METHOD];

/** Status pill tone (StatusBadge), also used for lab result and record statuses. */
export const STATUS_BADGE_TONE = {
  green: 'green',
  amber: 'amber',
  coral: 'coral'
} as const;

export type StatusBadgeTone = (typeof STATUS_BADGE_TONE)[keyof typeof STATUS_BADGE_TONE];

/** Avatar background tone. */
export const AVATAR_TONE = {
  navy: 'navy',
  green: 'green',
  blue: 'blue',
  amber: 'amber'
} as const;

export type AvatarTone = (typeof AVATAR_TONE)[keyof typeof AVATAR_TONE];

/** Book appointment: visual/selection state of a single time slot. */
export const TIME_SLOT_STATUS = {
  available: 'available',
  selected: 'selected',
  taken: 'taken',
  past: 'past'
} as const;

export type TimeSlotStatus = (typeof TIME_SLOT_STATUS)[keyof typeof TIME_SLOT_STATUS];

/** Records: what a record row shows on its trailing edge. */
export const RECORD_TRAILING_KIND = {
  badge: 'badge',
  chevron: 'chevron'
} as const;

export type RecordTrailingKind = (typeof RECORD_TRAILING_KIND)[keyof typeof RECORD_TRAILING_KIND];

/** Medicines: icon-box / stock-fill tint (distinct from the badge tone; has "blue"). */
export const MEDICINE_TINT = {
  green: 'green',
  blue: 'blue',
  coral: 'coral'
} as const;

export type MedicineTint = (typeof MEDICINE_TINT)[keyof typeof MEDICINE_TINT];

/** My Appointments: optional leading icon on an appointment card action. */
export const APPOINTMENT_ACTION_ICON = {
  video: 'video'
} as const;

export type AppointmentActionIcon =
  (typeof APPOINTMENT_ACTION_ICON)[keyof typeof APPOINTMENT_ACTION_ICON];

/** Notifications: recency groups, in display order. */
export const NOTIFICATION_GROUP = {
  today: 'today',
  yesterday: 'yesterday',
  thisWeek: 'thisWeek',
  past: 'past'
} as const;

export type NotificationGroupId = (typeof NOTIFICATION_GROUP)[keyof typeof NOTIFICATION_GROUP];

/** Profile: the stats strip tiles. */
export const PROFILE_STAT_ID = {
  bloodGroup: 'bloodGroup',
  age: 'age',
  weight: 'weight'
} as const;

export type ProfileStatId = (typeof PROFILE_STAT_ID)[keyof typeof PROFILE_STAT_ID];

/** Avatar diameter: compact 44 (header), regular 48 (cards), large 64 (profile), xLarge 88 (photo edit). */
export const AVATAR_SIZE = {
  compact: 'compact',
  regular: 'regular',
  large: 'large',
  xLarge: 'xLarge'
} as const;

export type AvatarSize = (typeof AVATAR_SIZE)[keyof typeof AVATAR_SIZE];

/** Tinted 44px icon box (records, notifications, profile menu, medicines). */
export const ICON_TONE = {
  green: 'green',
  blue: 'blue',
  amber: 'amber',
  coral: 'coral'
} as const;

export type IconTone = (typeof ICON_TONE)[keyof typeof ICON_TONE];

/** IconButton look: bordered card square, or a filled green square with a white icon. */
export const ICON_BUTTON_VARIANT = {
  outline: 'outline',
  fill: 'fill'
} as const;

export type IconButtonVariant = (typeof ICON_BUTTON_VARIANT)[keyof typeof ICON_BUTTON_VARIANT];

/**
 * ScreenHeader title style: `centered` keeps the title centred between two 40px slots
 * (stack screens); `large` is the bigger tab-root title with no spacer slots.
 */
export const SCREEN_HEADER_VARIANT = {
  centered: 'centered',
  large: 'large'
} as const;

export type ScreenHeaderVariant =
  (typeof SCREEN_HEADER_VARIANT)[keyof typeof SCREEN_HEADER_VARIANT];

/** Backend API: dev server port and endpoint paths. */
export const API_CONFIG = {
  devServerPort: 3000
} as const;

export const API_ENDPOINTS = {
  signIn: '/api/auth/sign-in',
  dashboard: '/api/patients/me/dashboard'
} as const;

/** HTTP statuses the app branches on. `networkError` (0) means no response was received. */
export const HTTP_STATUS = {
  networkError: 0,
  unauthorized: 401
} as const;

/** Home: quick action tile looks (a tint, or the solid coral emergency tile). */
export const QUICK_ACTION_VARIANT = {
  green: 'green',
  blue: 'blue',
  amber: 'amber',
  emergency: 'emergency'
} as const;

export type QuickActionVariant = (typeof QUICK_ACTION_VARIANT)[keyof typeof QUICK_ACTION_VARIANT];

/** Home: vital tile icon tint. */
export const VITAL_TONE = {
  coral: 'coral',
  blue: 'blue',
  amber: 'amber'
} as const;

export type VitalTone = (typeof VITAL_TONE)[keyof typeof VITAL_TONE];
