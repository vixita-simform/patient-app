export const TAB_ROUTES = {
  home: "index",
  visits: "visits",
  records: "records",
  profile: "profile",
} as const;

export type TabRoute = (typeof TAB_ROUTES)[keyof typeof TAB_ROUTES];

// Stack screens outside the tab navigator, as Expo Router pathnames.
export const STACK_ROUTES = {
  home: "/",
  findADoctor: "/find-a-doctor",
  doctorProfile: "/doctor-profile",
  bookAppointment: "/book-appointment",
  myAppointments: "/my-appointments",
  labReportDetail: "/lab-report-detail",
  medicines: "/medicines",
  notifications: "/notifications",
} as const;
