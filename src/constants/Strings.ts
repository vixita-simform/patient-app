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
  of: "of",
  inPerson: "In-person",
  videoCall: "Video call",
  bloodGroup: "Blood group",
  // Separators between two dynamic values, e.g. "Dr. Rao · 22 Sep", "13.5 – 17.5".
  dotSeparator: " · ",
  rangeSeparator: " – ",
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
  atTheHospital: "At the hospital",
  fromHome: "From home",
  reasonForVisit: "Reason for visit",
  reasonPlaceholder: "Describe your symptoms or reason for the visit",
  selectATimeSlot: "Select a time slot",
  confirmBooking: "Confirm booking",
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
  editProfile: "Edit profile",
  uhidPrefix: "UHID: ",
  yrsSuffix: " yrs",
  kgSuffix: " kg",
  age: "Age",
  weight: "Weight",
  personalMedicalInfo: "Personal & medical info",
  familyMembers: "Family members",
  insuranceClaims: "Insurance & claims",
  vitalsHistory: "Vitals history",
  settings: "Settings",
  helpSupport: "Help & support",
  logOut: "Log out",
  logOutFailed: "Could not log out. Please try again.",
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
  normalRangePrefix: "Normal",
  downloadPdf: "Download PDF",
  notFound: "Report not found",
});

const MedicinesScreen = freezeStringsObject({
  title: "My medicines",
  addMedicine: "Add medicine",
  todaysDoses: "Today's doses",
  activePrescription: "Active prescription",
  taken: "Taken",
  // "2 of 3 taken": the counts come from data.
  dosesTakenSuffix: "taken",
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

const PersonalAndMedicalInfoScreen = freezeStringsObject({
  title: "Medical info",
  fullName: "Full name",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  male: "Male",
  female: "Female",
  other: "Other",
  bloodAPositive: "A+",
  bloodANegative: "A\u2212",
  bloodBPositive: "B+",
  bloodBNegative: "B\u2212",
  bloodOPositive: "O+",
  bloodONegative: "O\u2212",
  bloodABPositive: "AB+",
  bloodABNegative: "AB\u2212",
  allergies: "Allergies",
  addAllergy: "+ Add",
  removeAllergy: "Remove allergy",
  existingConditions: "Existing conditions",
  emergencyContact: "Emergency contact",
  editPhoto: "Edit photo",
  saveChanges: "Save changes",
});

/**
 * Sign in screen.
 */
const SignInScreen = freezeStringsObject({
  hospitalName: "CAREWELL HOSPITAL",
  title: "Sign in to your\npatient account",
  subtitle: "Use the mobile number you registered with the hospital.",
  tabMobileNumber: "Mobile number",
  tabPatientId: "Patient ID",
  mobilePlaceholder: "98765 43210",
  patientIdPlaceholder: "e.g. CW-102938",
  getOtp: "Get OTP",
  or: "or",
  signInWithPassword: "Sign in with password",
  newPatientPrefix: "New patient? Register at the hospital help desk or on ",
  websiteLink: "carewell.in",
  newPatientSuffix: ", then sign in here.",
  emergencyCall: "Emergency? Call 108",
  selectCountry: "Select country code",
  closeCountryPicker: "Close country list",
  changeCountryCode: "Change country code",
  mobileRequired: "Enter your mobile number",
  mobileDigitsOnly: "Use digits only",
  mobileLengthPrefix: "Mobile number must be ",
  mobileLengthSuffix: " digits",
  mobileInvalidStart: "Enter a valid mobile number for this country",
  patientIdRequired: "Enter your patient ID",
  patientIdTooShort: "Patient ID must be at least 4 characters",
  patientIdInvalid: "Use letters, numbers and hyphens only",
  signInFailed: "Could not sign in. Please try again.",
  callFailed: "Could not start the call. Please dial 108 from your phone.",
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
  PersonalAndMedicalInfoScreen,
  SignInScreen,
});
