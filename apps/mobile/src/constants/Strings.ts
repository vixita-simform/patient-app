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
  today: "Today",
  notifications: "Notifications",
  labReports: "Lab reports",
  somethingWentWrong: "Something went wrong. Please try again.",
  // Blood groups, shown on Profile and the medical info form.
  bloodAPositive: "A+",
  bloodANegative: "A\u2212",
  bloodBPositive: "B+",
  bloodBNegative: "B\u2212",
  bloodOPositive: "O+",
  bloodONegative: "O\u2212",
  bloodABPositive: "AB+",
  bloodABNegative: "AB\u2212",
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
  yourOpdToken: "Your OPD token",
  nowServing: "Now serving",
  patientsAhead: "patients ahead",
  // "About 12 min wait": approximation, not the section heading.
  about: "About",
  minWait: "min wait",
  bookVisit: "Book visit",
  medicines: "Medicines",
  callAmbulance: "Call ambulance",
  nextAppointment: "Next appointment",
  seeAll: "See all",
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
  bookingComingSoonTitle: "Booking opens soon",
  bookingComingSoonMessage: "Online booking isn't available yet. Please call the hospital help desk to book this slot.",
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
});

const RecordsScreen = freezeStringsObject({
  headerTitle: "Medical records",
  search: "Search",
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
  logOutConfirmTitle: "Log out?",
  logOutConfirmMessage: "You will need to sign in again to see your health records.",
});

const LabReportDetailScreen = freezeStringsObject({
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
  doseNext: "Next dose",
  dosePending: "Later today",
});

const NotificationsScreen = freezeStringsObject({
  markAllRead: "Mark all read",
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

/**
 * Weekday and month names used by the date formatters.
 */
const Dates = freezeStringsObject({
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  jan: "Jan",
  feb: "Feb",
  mar: "Mar",
  apr: "Apr",
  may: "May",
  jun: "Jun",
  jul: "Jul",
  aug: "Aug",
  sep: "Sep",
  oct: "Oct",
  nov: "Nov",
  dec: "Dec",
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  mayLong: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
  am: "AM",
  pm: "PM",
});

/**
 * Country names for the sign-in country-code picker.
 */
const CountryNames = freezeStringsObject({
  india: "India",
  unitedStates: "United States",
  unitedKingdom: "United Kingdom",
  unitedArabEmirates: "United Arab Emirates",
  saudiArabia: "Saudi Arabia",
  singapore: "Singapore",
  australia: "Australia",
  canada: "Canada",
  bangladesh: "Bangladesh",
  nepal: "Nepal",
  sriLanka: "Sri Lanka",
  pakistan: "Pakistan",
});

export default Object.freeze({
  Common,
  Dates,
  CountryNames,
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
