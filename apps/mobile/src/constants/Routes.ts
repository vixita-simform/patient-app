export const TAB_ROUTES = {
  home: 'index',
  visits: 'visits',
  records: 'records',
  profile: 'profile'
} as const;

export type TabRoute = (typeof TAB_ROUTES)[keyof typeof TAB_ROUTES];

// Stack screens outside the tab navigator, as Expo Router pathnames.
export const STACK_ROUTES = {
  signIn: '/sign-in',
  home: '/',
  findADoctor: '/find-a-doctor',
  doctorProfile: '/doctor-profile',
  bookAppointment: '/book-appointment',
  myAppointments: '/my-appointments',
  labReportDetail: '/lab-report-detail',
  medicines: '/medicines',
  notifications: '/notifications',
  personalAndMedicalInfo: '/personal-and-medical-info'
} as const;

// Root stack route names, guarded by auth state in the root layout.
export const ROOT_ROUTES = {
  signIn: '(auth)/sign-in',
  protected: '(protected)'
} as const;
