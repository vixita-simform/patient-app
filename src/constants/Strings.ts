/**
 * An object that represents a mapping of keys to string values.
 * @interface
 */
type KeyStringValueMap = Record<string, string>;

/**
 * Freezes an object conforming to the KeyStringValueMap interface.
 * @function
 * @param {T} strings - The object to be frozen.
 * @returns {T} The frozen object.
 */
const freezeStringsObject = <T extends KeyStringValueMap>(strings: T): T =>
  Object.freeze(strings);

/**
 * Wording shared by more than one screen.
 */
const Common = freezeStringsObject({
  back: "Back",
  cancel: "Cancel",
  done: "Done",
});

const TabBar = freezeStringsObject({
  home: "Home",
  visits: "Visits",
  records: "Records",
  profile: "Profile",
});

/**
 * A collection of labels for the HomeScreen.
 * @type {Object}
 */
const HomeScreen = freezeStringsObject({
  goodMorning: "Good morning",
  notifications: "Notifications",
  yourOpdToken: "Your OPD token",
  nowServing: "Now serving",
  patientsAhead: "patients ahead",
  // "About 12 min wait": approximation, not the section heading.
  about: "About",
  minWait: "min wait",
  bookVisit: "Book visit",
  labReports: "Lab reports",
  medicines: "Medicines",
  callAmbulance: "Call ambulance",
  nextAppointment: "Next appointment",
  seeAll: "See all",
  today: "Today",
  latestVitals: "Latest vitals",
  history: "History",
  heartRate: "Heart rate",
  bloodPressure: "Blood pressure",
  sugar: "Sugar",
});

const FindADoctorScreen = freezeStringsObject({
  title: "Find a doctor",
  filter: "Filter",
  searchPlaceholder: "Search doctor, department or symptom",
  all: "All",
  cardiology: "Cardiology",
  orthopedics: "Orthopedics",
  pediatrics: "Pediatrics",
  dermatology: "Dermatology",
  ent: "ENT",
  doctorsAvailableToday: "doctors available today",
  doctorAvailableToday: "doctor available today",
  errorMessage: "Something went wrong. Please try again.",
  emptyMessage: "No doctors found",
});

const DoctorCard = freezeStringsObject({
  yrsExp: "yrs exp.",
  reviews: "reviews",
  nextAvailable: "Next available",
  book: "Book",
});

const DoctorProfileScreen = freezeStringsObject({
  favourite: "Favourite",
  yrs: "yrs",
  experience: "Experience",
  patients: "Patients",
  rating: "Rating",
  about: "About",
  opdHours: "OPD hours",
  closed: "Closed",
  consultationFee: "Consultation fee",
  insuranceAccepted: "Insurance accepted",
  videoConsult: "Video consultation",
  bookAppointment: "Book appointment",
  notFound: "Doctor not found",
  loadError: "Could not load this doctor. Please try again.",
});

const BookAppointmentScreen = freezeStringsObject({
  changeMonth: "Change month",
  availableSlots: "Available slots",
  visitType: "Visit type",
  inPerson: "In-person",
  atTheHospital: "At the hospital",
  videoCall: "Video call",
  fromHome: "From home",
  reasonForVisit: "Reason for visit",
  reasonPlaceholder: "Describe your symptoms or reason for the visit",
  selectATimeSlot: "Select a time slot",
  confirmBooking: "Confirm booking",
  notFound: "Doctor not found",
});

const MyAppointmentsScreen = freezeStringsObject({
  title: "Appointments",
  addAppointment: "Add appointment",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  pending: "Pending",
  reschedule: "Reschedule",
  getDirections: "Get directions",
  joinCall: "Join call",
  inPerson: "In-person",
  videoCall: "Video call",
  emptyMessage: "No appointments here yet",
  errorMessage: "Something went wrong. Please try again.",
});

const RecordsScreen = freezeStringsObject({
  headerTitle: "Medical records",
  search: "Search",
  labReports: "Lab reports",
  prescriptions: "Prescriptions",
  discharges: "Discharges",
});

const ProfileScreen = freezeStringsObject({
  title: "Profile",
});

const LabReportDetailScreen = freezeStringsObject({
  title: "Blood count",
  share: "Share",
  sampleCollected: "Sample collected",
  orderedBy: "Ordered by",
  reportId: "Report ID",
  normal: "Normal",
  low: "Low",
  borderline: "Borderline",
  // Prefix for the per-result range line, e.g. "Normal 13.5 – 17.5".
  normalRangePrefix: "Normal ",
  downloadPdf: "Download PDF",
  notFound: "Report not found",
});

const MedicinesScreen = freezeStringsObject({
  title: "My medicines",
  addMedicine: "Add medicine",
  todaysDoses: "Today's doses",
  activePrescription: "Active prescription",
  taken: "Taken",
  refillSoon: "Refill soon",
  stockLeft: "Stock left",
  orderRefill: "Order refill from hospital pharmacy",
});

const NotificationsScreen = freezeStringsObject({
  title: "Notifications",
  markAllRead: "Mark all read",
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This Week",
  past: "Past",
  unread: "Unread",
  minAgoSuffix: "min ago",
  hrAgoSuffix: "hr ago",
});

export default Object.freeze({
  Common,
  TabBar,
  HomeScreen,
  FindADoctorScreen,
  DoctorCard,
  DoctorProfileScreen,
  BookAppointmentScreen,
  MyAppointmentsScreen,
  RecordsScreen,
  ProfileScreen,
  LabReportDetailScreen,
  MedicinesScreen,
  NotificationsScreen,
});
