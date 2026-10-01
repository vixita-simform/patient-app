import {
  APPOINTMENT_STATUS,
  DOSE_STATUS,
  MEDICINE_TINT,
  NOTIFICATION_TYPE,
  RECORD_TRAILING_KIND,
  RECORD_TYPE,
  STATUS_BADGE_TONE,
  VISIT_MODE,
} from "./Constants";
import type {
  AppointmentListResponse,
  DoctorListResponse,
  DoctorProfileDetails,
  HomeDashboardResponse,
  LabReportDetail,
  MedicinesResponse,
  NotificationItem,
  RecordListResponse,
} from "../types";

/** Record id of the latest lab report; the Home "Lab reports" shortcut opens it. */
export const LATEST_LAB_REPORT_ID = "rec_cbc";

/** Stand-in for the Home dashboard API until the backend is wired up. */
export const homeScreenDummyData: HomeDashboardResponse = {
  patient: {
    id: "pat_1024",
    firstName: "Aarav",
    lastName: "Patel",
  },
  opdToken: {
    tokenNumber: "A-24",
    department: "Cardiology",
    nowServing: "A-18",
    patientsAhead: 6,
    estimatedWaitMinutes: 25,
    queueProgress: 0.72,
  },
  nextAppointment: {
    id: "apt_5531",
    doctor: {
      id: "doc_204",
      name: "Dr. Rohan Mehta",
      specialty: "Cardiologist",
    },
    room: "Room 204",
    scheduledAt: "2026-09-29T11:30:00",
  },
  vitals: {
    heartRate: { value: 78, unit: "bpm" },
    bloodPressure: { systolic: 122, diastolic: 80, unit: "mmHg" },
    bloodSugar: { value: 96, unit: "mg/dL" },
    recordedAt: "2026-09-28T08:15:00",
  },
};

/** Stand-in for the Find a doctor API until the backend is wired up. */
export const findADoctorDummyData: DoctorListResponse = {
  totalAvailableToday: 42,
  doctors: [
    {
      id: "doc_204",
      initials: "RM",
      name: "Dr. Rohan Mehta",
      specialty: "cardiology",
      specialtyLabel: "Cardiologist",
      experienceYears: 14,
      rating: "4.9",
      reviewCount: 320,
      nextSlot: "Today, 11:30 AM",
      availableToday: true,
    },
    {
      id: "doc_311",
      initials: "SK",
      name: "Dr. Sneha Kapoor",
      specialty: "pediatrics",
      specialtyLabel: "Pediatrician",
      experienceYears: 9,
      rating: "4.8",
      reviewCount: 210,
      nextSlot: "Today, 2:00 PM",
      availableToday: true,
    },
    {
      id: "doc_478",
      initials: "VD",
      name: "Dr. Vikram Desai",
      specialty: "orthopedics",
      specialtyLabel: "Orthopedic surgeon",
      experienceYears: 18,
      rating: "4.7",
      reviewCount: 412,
      nextSlot: "Wed, 10:00 AM",
      availableToday: false,
    },
  ],
};

/** Stand-in for the doctor profile API, keyed by the doctor id from the list. */
export const doctorProfileDummyData: Readonly<Record<string, DoctorProfileDetails>> =
  Object.freeze({
    doc_204: {
      qualifications: "MBBS, MD, DM (Cardiology)",
      patientsCount: "3,200+",
      about:
        "Senior consultant in interventional cardiology. Treats heart rhythm problems, high blood pressure and coronary artery disease, and performs angioplasty.",
      opdHours: [
        { id: "monFri", label: "Mon – Fri", hours: "10:00 AM – 2:00 PM" },
        { id: "sat", label: "Saturday", hours: "10:00 AM – 12:00 PM" },
        { id: "sun", label: "Sunday", hours: null },
      ],
      locationTitle: "Cardiology wing, Block B",
      locationSubtitle: "2nd floor, Room 204",
      consultationFee: 800,
      insuranceAccepted: true,
    },
    doc_311: {
      qualifications: "MBBS, MD (Pediatrics)",
      patientsCount: "2,400+",
      about:
        "Consultant pediatrician caring for newborns, children and teenagers. Focus on vaccinations, growth monitoring and childhood allergies.",
      opdHours: [
        { id: "monFri", label: "Mon – Fri", hours: "2:00 PM – 6:00 PM" },
        { id: "sat", label: "Saturday", hours: "10:00 AM – 1:00 PM" },
        { id: "sun", label: "Sunday", hours: null },
      ],
      locationTitle: "Pediatrics wing, Block A",
      locationSubtitle: "1st floor, Room 112",
      consultationFee: 600,
      insuranceAccepted: true,
    },
    doc_478: {
      qualifications: "MBBS, MS (Orthopedics)",
      patientsCount: "4,100+",
      about:
        "Orthopedic surgeon specialising in joint replacement, sports injuries and fracture care, with over eighteen years of surgical experience.",
      opdHours: [
        { id: "monFri", label: "Mon – Fri", hours: "9:00 AM – 1:00 PM" },
        { id: "sat", label: "Saturday", hours: "9:00 AM – 11:00 AM" },
        { id: "sun", label: "Sunday", hours: null },
      ],
      locationTitle: "Orthopedics wing, Block C",
      locationSubtitle: "Ground floor, Room 018",
      consultationFee: 1000,
      insuranceAccepted: false,
    },
  });

/**
 * Stand-in for the My Appointments API, grouped by tab, until the backend is wired up.
 * Every entry reuses a real `findADoctorDummyData.doctors` id so a card tap resolves a doctor.
 */
export const appointmentsDummyData: AppointmentListResponse = {
  upcoming: [
    {
      id: "appt_upc_1",
      doctorId: "doc_204",
      initials: "RM",
      doctorName: "Dr. Rohan Mehta",
      specialtyLabel: "Cardiology",
      visitMode: VISIT_MODE.inPerson,
      status: APPOINTMENT_STATUS.confirmed,
      scheduledAt: "2026-09-29T11:30:00",
    },
    {
      id: "appt_upc_2",
      doctorId: "doc_311",
      initials: "SK",
      doctorName: "Dr. Sneha Kapoor",
      specialtyLabel: "Pediatrics",
      visitMode: VISIT_MODE.video,
      status: APPOINTMENT_STATUS.pending,
      scheduledAt: "2026-10-02T16:15:00",
    },
    {
      id: "appt_upc_3",
      doctorId: "doc_478",
      initials: "VD",
      doctorName: "Dr. Vikram Desai",
      specialtyLabel: "Orthopedics",
      visitMode: VISIT_MODE.inPerson,
      status: APPOINTMENT_STATUS.confirmed,
      scheduledAt: "2026-10-12T10:00:00",
    },
  ],
  completed: [
    {
      id: "appt_com_1",
      doctorId: "doc_204",
      initials: "RM",
      doctorName: "Dr. Rohan Mehta",
      specialtyLabel: "Cardiology",
      visitMode: VISIT_MODE.inPerson,
      status: APPOINTMENT_STATUS.completed,
      scheduledAt: "2026-08-14T09:30:00",
    },
    {
      id: "appt_com_2",
      doctorId: "doc_478",
      initials: "VD",
      doctorName: "Dr. Vikram Desai",
      specialtyLabel: "Orthopedics",
      visitMode: VISIT_MODE.inPerson,
      status: APPOINTMENT_STATUS.completed,
      scheduledAt: "2026-07-30T13:00:00",
    },
  ],
  cancelled: [
    {
      id: "appt_can_1",
      doctorId: "doc_311",
      initials: "SK",
      doctorName: "Dr. Sneha Kapoor",
      specialtyLabel: "Pediatrics",
      visitMode: VISIT_MODE.video,
      status: APPOINTMENT_STATUS.cancelled,
      scheduledAt: "2026-08-02T15:00:00",
    },
  ],
};

/** Stand-in for the Medical Records API, grouped by month, until the backend is wired up. */
export const recordsDummyData: RecordListResponse = {
  stats: {
    labReportsCount: 24,
    prescriptionsCount: 8,
    dischargesCount: 3,
  },
  groups: [
    {
      id: "grp_2026_09",
      monthLabel: "September 2026",
      records: [
        {
          id: LATEST_LAB_REPORT_ID,
          type: RECORD_TYPE.labReport,
          title: "Complete blood count",
          subtitle: "Pathology lab · 24 Sep",
          trailing: { kind: RECORD_TRAILING_KIND.badge, label: "1 flag", tone: STATUS_BADGE_TONE.coral },
          pressable: false,
        },
        {
          id: "rec_ecg",
          type: RECORD_TYPE.scan,
          title: "ECG report",
          subtitle: "Cardiology · 22 Sep",
          trailing: { kind: RECORD_TRAILING_KIND.badge, label: "Normal", tone: STATUS_BADGE_TONE.green },
        },
        {
          id: "rec_prescription",
          type: RECORD_TYPE.prescription,
          title: "Prescription",
          subtitle: "Dr. Rohan Mehta · 22 Sep",
          trailing: { kind: RECORD_TRAILING_KIND.chevron },
        },
      ],
    },
    {
      id: "grp_2026_07",
      monthLabel: "July 2026",
      records: [
        {
          id: "rec_discharge",
          type: RECORD_TYPE.discharge,
          title: "Discharge summary",
          subtitle: "Ward 3B · 4 days stay",
          trailing: { kind: RECORD_TRAILING_KIND.chevron },
        },
        {
          id: "rec_xray",
          type: RECORD_TYPE.scan,
          title: "Chest X-ray",
          subtitle: "Radiology · 11 Jul",
          trailing: { kind: RECORD_TRAILING_KIND.badge, label: "Normal", tone: STATUS_BADGE_TONE.green },
        },
      ],
    },
  ],
};

/**
 * Stand-in for the Notifications API until the backend is wired up. Flat and ungrouped —
 * `useNotificationsScreen` buckets these into recency groups client-side. Today/Yesterday
 * entries copy the spec's verbatim titles/subtitles; This Week/Past have no design
 * reference so their copy is illustrative only. Timestamps are built relative to `now`
 * on each call, so "2 min ago" stays true instead of freezing at module load.
 * @param {Date} now - reference time; defaults to the current time.
 * @returns {readonly NotificationItem[]} The dummy notifications, newest first.
 */
export const getNotificationsDummyData = (now: Date = new Date()): readonly NotificationItem[] => {
  const minutesAgo = (minutes: number): string =>
    new Date(now.getTime() - minutes * 60 * 1000).toISOString();
  const hoursAgo = (hours: number): string => minutesAgo(hours * 60);
  const daysAgo = (days: number, hour: number, minute: number): string => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  return [
    // Today (2 unread, 1 read)
    {
      id: "notif_queue",
      type: NOTIFICATION_TYPE.queueUpdate,
      title: "Your turn is coming up",
      subtitle: "Token A-24 · 6 patients ahead. Please wait near Room 204.",
      createdAt: minutesAgo(2),
      unread: true,
    },
    {
      id: "notif_lab",
      type: NOTIFICATION_TYPE.labReport,
      title: "Lab report ready",
      subtitle: "Your complete blood count results are available.",
      createdAt: hoursAgo(1),
      unread: true,
    },
    {
      id: "notif_medicine",
      type: NOTIFICATION_TYPE.medicine,
      title: "Medicine reminder",
      subtitle: "Take Metoprolol 25 mg at 6:00 PM.",
      createdAt: hoursAgo(3),
      unread: false,
    },
    // Yesterday (all read)
    {
      id: "notif_appointment",
      type: NOTIFICATION_TYPE.appointment,
      title: "Appointment confirmed",
      subtitle: "Dr. Rohan Mehta, Tue 29 Sep at 11:30 AM.",
      createdAt: daysAgo(1, 18, 40),
      unread: false,
    },
    {
      id: "notif_bill",
      type: NOTIFICATION_TYPE.billing,
      title: "Bill generated",
      subtitle: "₹4,350 due by 5 Oct. Pay online to skip the billing queue.",
      createdAt: daysAgo(1, 14, 15),
      unread: false,
    },
    {
      id: "notif_insurance",
      type: NOTIFICATION_TYPE.insurance,
      title: "Insurance claim approved",
      subtitle: "₹18,000 approved for your July ward stay.",
      createdAt: daysAgo(1, 10, 5),
      unread: false,
    },
    // This Week (no design reference — illustrative copy in the same tone)
    {
      id: "notif_prescription_renewed",
      type: NOTIFICATION_TYPE.medicine,
      title: "Prescription renewed",
      subtitle: "Atorvastatin 10 mg renewed for another 30 days.",
      createdAt: daysAgo(4, 9, 0),
      unread: false,
    },
    {
      id: "notif_appointment_rescheduled",
      type: NOTIFICATION_TYPE.appointment,
      title: "Appointment rescheduled",
      subtitle: "Moved to Thu 2 Oct at 4:15 PM with Dr. Sneha Kapoor.",
      createdAt: daysAgo(6, 12, 30),
      unread: false,
    },
    // Past (older than a week — no design reference)
    {
      id: "notif_checkup_reminder",
      type: NOTIFICATION_TYPE.queueUpdate,
      title: "Annual checkup reminder",
      subtitle: "It's been a year since your last full body checkup.",
      createdAt: daysAgo(30, 9, 0),
      unread: false,
    },
    {
      id: "notif_discharge_summary",
      type: NOTIFICATION_TYPE.labReport,
      title: "Discharge summary available",
      subtitle: "Your Ward 3B discharge summary has been uploaded.",
      createdAt: daysAgo(45, 16, 0),
      unread: false,
    },
  ];
};

/**
 * Safe lookup of a doctor's profile by route id: only own keys match, so ids such as
 * "constructor" or "__proto__" return undefined instead of prototype members.
 * @param {string} id - doctor id from the route.
 * @returns {DoctorProfileDetails | undefined} the profile, or undefined when unknown.
 */
export const getDoctorProfileDetails = (id: string): DoctorProfileDetails | undefined =>
  Object.hasOwn(doctorProfileDummyData, id) ? doctorProfileDummyData[id] : undefined;

/** Stand-in for the Lab Report Detail API, keyed by the records-list record id. */
export const labReportDetailDummyData: Readonly<Record<string, LabReportDetail>> = Object.freeze({
  [LATEST_LAB_REPORT_ID]: {
    id: LATEST_LAB_REPORT_ID,
    sampleCollectedAt: "24 Sep, 8:10 AM",
    orderedByDoctorName: "Dr. Rohan Mehta",
    reportId: "LAB-58213",
    alertMessage:
      "Haemoglobin is below the normal range. Your doctor will review this at your next visit.",
    results: [
      {
        id: "res_haemoglobin",
        name: "Haemoglobin",
        value: 11.2,
        unit: "g/dL",
        normalMin: 13.5,
        normalMax: 17.5,
        status: STATUS_BADGE_TONE.coral,
        statusLabel: "Low",
      },
      {
        id: "res_wbc",
        name: "WBC count",
        value: 7400,
        unit: "/µL",
        normalMin: 4500,
        normalMax: 11000,
        status: STATUS_BADGE_TONE.green,
        statusLabel: "Normal",
      },
      {
        id: "res_platelets",
        name: "Platelets",
        value: 2.6,
        unit: "lakh/µL",
        normalMin: 1.5,
        normalMax: 4.5,
        status: STATUS_BADGE_TONE.green,
        statusLabel: "Normal",
      },
      {
        id: "res_rbc",
        name: "RBC count",
        value: 4.3,
        unit: "mill/µL",
        normalMin: 4.5,
        normalMax: 5.9,
        status: STATUS_BADGE_TONE.amber,
        statusLabel: "Borderline",
      },
    ],
  },
});

/**
 * Safe lookup of a lab report's detail by route id: only own keys match, so ids
 * such as "constructor" or "__proto__" return undefined instead of prototype members.
 * @param {string} id - record id from the route (e.g. "rec_cbc").
 * @returns {LabReportDetail | undefined} the report detail, or undefined when unknown.
 */
export const getLabReportDetail = (id: string): LabReportDetail | undefined =>
  Object.hasOwn(labReportDetailDummyData, id) ? labReportDetailDummyData[id] : undefined;

/** Stand-in for the Medicines API until the backend is wired up. */
export const medicinesDummyData: MedicinesResponse = {
  doses: [
    { id: "dose_8am", time: "8 AM", status: DOSE_STATUS.done },
    { id: "dose_1pm", time: "1 PM", status: DOSE_STATUS.done },
    { id: "dose_6pm", time: "6 PM", status: DOSE_STATUS.next },
    { id: "dose_10pm", time: "10 PM", status: DOSE_STATUS.pending },
  ],
  activePrescription: {
    prescriberName: "Dr. Rohan Mehta",
    date: "22 Sep",
    medicines: [
      {
        id: "med_atorvastatin",
        name: "Atorvastatin 10 mg",
        statusLabel: "Taken",
        statusTone: STATUS_BADGE_TONE.green,
        tintKey: MEDICINE_TINT.green,
        dosage: "1 tablet · after dinner · 30 days",
        stockRemaining: 18,
        stockTotal: 30,
        showRefillButton: false,
      },
      {
        id: "med_metoprolol",
        name: "Metoprolol 25 mg",
        statusLabel: "6 PM",
        statusTone: STATUS_BADGE_TONE.amber,
        tintKey: MEDICINE_TINT.blue,
        dosage: "1 tablet · twice a day · 60 days",
        stockRemaining: 44,
        stockTotal: 120,
        showRefillButton: false,
      },
      {
        id: "med_iron_folic",
        name: "Iron + Folic acid",
        statusLabel: "Refill soon",
        statusTone: STATUS_BADGE_TONE.coral,
        tintKey: MEDICINE_TINT.coral,
        dosage: "1 capsule · after lunch · 45 days",
        stockRemaining: 3,
        stockTotal: 45,
        showRefillButton: true,
      },
    ],
  },
};
