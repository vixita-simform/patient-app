export const TAB_ROUTES = {
  home: "index",
  documents: "documents",
  upload: "upload",
  messages: "messages",
  more: "more",
} as const;

export type TabRoute = (typeof TAB_ROUTES)[keyof typeof TAB_ROUTES];

// Stack screens outside the tab navigator, as Expo Router pathnames.
export const STACK_ROUTES = {
  home: "/",
  notifications: "/notifications",
  checklist: "/checklist",
  signing: "/signing",
  team: "/team",
  aml: "/aml",
  invoices: "/invoices",
  meetings: "/meetings",
  services: "/services",
  datafeeds: "/datafeeds",
  links: "/links",
  profile: "/profile",
  help: "/help",
} as const;
