import type {
  DoctorListResponse,
  DoctorProfileDetails,
  HomeDashboardResponse,
} from "../types";

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
 * Safe lookup of a doctor's profile by route id: only own keys match, so ids such as
 * "constructor" or "__proto__" return undefined instead of prototype members.
 * @param {string} id - doctor id from the route.
 * @returns {DoctorProfileDetails | undefined} the profile, or undefined when unknown.
 */
export const getDoctorProfileDetails = (id: string): DoctorProfileDetails | undefined =>
  Object.hasOwn(doctorProfileDummyData, id) ? doctorProfileDummyData[id] : undefined;
