import type {
  ClientCode,
  DocumentItem,
  HomeSummary,
  MoreItem,
  MessageThread,
  NotificationItem,
  Recipient,
  TeamMember,
  ThreadAttachment,
  UploadedDocument,
} from "../types";

import Strings from "./Strings";

export const CLIENT_CODES: ClientCode[] = [
  {
    code: "OD-1042",
    name: "Michael O'Donoghue",
    farm: "O'Donoghue Dairy Farm · Kilkenny",
  },
  {
    code: "KF-2087",
    name: "Kelly Farms Ltd",
    farm: "Kelly Farms · Tipperary",
  },
  {
    code: "BW-3391",
    name: "Brookwood Agri Co.",
    farm: "Brookwood Agri · Cork",
  },
];

export const DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    name: "Annual Accounts 2024",
    type: "Annual Accounts",
    year: "2024",
    date: "2025-01-15",
    status: "Completed",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Q3 Management Accounts",
    type: "Management Accounts",
    year: "2024",
    date: "2024-10-22",
    status: "Completed",
    size: "1.1 MB",
  },
  {
    id: 3,
    name: "Tax Return 2024",
    type: "Tax Return",
    year: "2024",
    date: "2025-02-01",
    status: "Under review",
    size: "890 KB",
  },
  {
    id: 4,
    name: "VAT Return Q4 2024",
    type: "VAT Return",
    year: "2024",
    date: "2025-01-20",
    status: "Completed",
    size: "340 KB",
  },
  {
    id: 5,
    name: "Tax Clearance Cert",
    type: "Tax Clearance",
    year: "2024",
    date: "2024-12-15",
    status: "Completed",
    size: "156 KB",
  },
  {
    id: 6,
    name: "VAT Return Q3 2024",
    type: "VAT Return",
    year: "2024",
    date: "2024-10-18",
    status: "Completed",
    size: "322 KB",
  },
  {
    id: 7,
    name: "Annual Accounts 2023",
    type: "Annual Accounts",
    year: "2023",
    date: "2024-01-12",
    status: "Completed",
    size: "2.2 MB",
  },
  {
    id: 8,
    name: "H1 Management Accounts",
    type: "Management Accounts",
    year: "2023",
    date: "2023-08-05",
    status: "Completed",
    size: "980 KB",
  },
  {
    id: 9,
    name: "Tax Return 2023",
    type: "Tax Return",
    year: "2023",
    date: "2024-02-10",
    status: "Completed",
    size: "860 KB",
  },
  {
    id: 10,
    name: "VAT Return Q2 2024",
    type: "VAT Return",
    year: "2024",
    date: "2024-07-20",
    status: "Completed",
    size: "318 KB",
  },
  {
    id: 11,
    name: "Tax Clearance Cert 2023",
    type: "Tax Clearance",
    year: "2023",
    date: "2023-12-11",
    status: "Completed",
    size: "148 KB",
  },
];

export const MESSAGES: MessageThread[] = [
  {
    id: 1,
    topic: "Capital Gains Query",
    from: "Sarah Murphy",
    preview: "Morning Sarah — yes, I have the sale contract.",
    time: "10:32 AM",
    unread: true,
    closed: false,
    participants: ["Sarah Murphy", "Michael O'Donoghue"],
    thread: [
      {
        id: "m1",
        sender: "Sarah Murphy",
        staff: true,
        text: "Hi Michael, just checking in about the capital gains query on the land sale.",
        time: "10:30 AM",
      },
      {
        id: "m2",
        sender: "Michael O'Donoghue",
        staff: false,
        text: "Morning Sarah — yes, I have the sale contract.",
        time: "10:31 AM",
      },
      {
        id: "m3",
        sender: "Michael O'Donoghue",
        staff: false,
        attachment: {
          name: "Sale Contract.pdf",
          size: "1.2 MB",
        },
        time: "10:32 AM",
      },
    ],
  },
  {
    id: 2,
    topic: "Annual Accounts 2024",
    from: "Conor O'Brien",
    preview: "I've added the financial planning note as well.",
    time: "Yesterday",
    unread: true,
    closed: false,
    participants: ["Conor O'Brien", "Declan Kelly", "Michael O'Donoghue"],
    thread: [
      {
        id: "m4",
        sender: "Conor O'Brien",
        staff: true,
        text: "The annual accounts are finalised, please review when you get a chance.",
        time: "09:15 AM",
      },
      {
        id: "m5",
        sender: "Declan Kelly",
        staff: true,
        text: "I've added the financial planning note as well.",
        time: "09:20 AM",
      },
    ],
  },
  {
    id: 3,
    topic: "Payroll February",
    from: "Emma Walsh",
    preview: "Thanks Emma!",
    time: "Feb 18",
    unread: false,
    closed: true,
    closedDate: "Feb 20, 2025",
    participants: ["Emma Walsh", "Michael O'Donoghue"],
    thread: [
      {
        id: "m6",
        sender: "Emma Walsh",
        staff: true,
        text: "Payroll for February has been processed and submitted to Revenue.",
        time: "Feb 18",
      },
      {
        id: "m7",
        sender: "Emma Walsh",
        staff: true,
        attachment: {
          name: "Payslip Feb 2025.pdf",
          size: "210 KB",
        },
        time: "Feb 18",
      },
      {
        id: "m8",
        sender: "Michael O'Donoghue",
        staff: false,
        text: "Thanks Emma!",
        time: "Feb 18",
      },
    ],
  },
];

export const TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Sarah Murphy",
    role: "Accountant",
    img: "SM",
  },
  {
    id: 2,
    name: "Conor O'Brien",
    role: "Tax Advisor",
    img: "CO",
  },
  {
    id: 3,
    name: "Emma Walsh",
    role: "Payroll",
    img: "EW",
  },
  {
    id: 4,
    name: "Declan Kelly",
    role: "Financial Advisor",
    img: "DK",
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "New document available",
    body: "Your Annual Accounts 2024 are ready",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Invoice issued",
    body: "Invoice #INV-2024-089 for €2,450 issued",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    title: "AML reminder",
    body: "Identity verification expires in 30 days",
    time: "2 days ago",
    read: true,
  },
];

export const HOME_SUMMARY: HomeSummary = {
  outstandingCount: 2,
  pendingSignatureCount: 2,
};

export const MORE_ITEMS: MoreItem[] = [
  {
    id: "signing",
    label: Strings.MoreItems.signingLabel,
    icon: "pen",
    desc: Strings.MoreItems.signingDesc,
  },
  {
    id: "aml",
    label: Strings.MoreItems.amlLabel,
    icon: "shield",
    desc: Strings.MoreItems.amlDesc,
  },
  {
    id: "invoices",
    label: Strings.MoreItems.invoicesLabel,
    icon: "invoice",
    desc: Strings.MoreItems.invoicesDesc,
  },
  {
    id: "meetings",
    label: Strings.MoreItems.meetingsLabel,
    icon: "calendar",
    desc: Strings.MoreItems.meetingsDesc,
  },
  {
    id: "checklist",
    label: Strings.MoreItems.checklistLabel,
    icon: "checklist",
    desc: Strings.MoreItems.checklistDesc,
  },
  {
    id: "team",
    label: Strings.MoreItems.teamLabel,
    icon: "team",
    desc: Strings.MoreItems.teamDesc,
  },
  {
    id: "services",
    label: Strings.MoreItems.servicesLabel,
    icon: "services",
    desc: Strings.MoreItems.servicesDesc,
  },
  {
    id: "datafeeds",
    label: Strings.MoreItems.datafeedsLabel,
    icon: "data",
    desc: Strings.MoreItems.datafeedsDesc,
  },
  {
    id: "links",
    label: Strings.MoreItems.linksLabel,
    icon: "link",
    desc: Strings.MoreItems.linksDesc,
  },
  {
    id: "notifications",
    label: Strings.MoreItems.notificationsLabel,
    icon: "bell",
    desc: Strings.MoreItems.notificationsDesc,
  },
  {
    id: "profile",
    label: Strings.MoreItems.profileLabel,
    icon: "settings",
    desc: Strings.MoreItems.profileDesc,
  },
  {
    id: "help",
    label: Strings.MoreItems.helpLabel,
    icon: "help",
    desc: Strings.MoreItems.helpDesc,
  },
];

export const DOCUMENT_TYPES: readonly string[] = [
  "Annual Accounts",
  "Tax Return",
  "VAT Return",
  "Management Accounts",
  "Tax Clearance",
];

/** Category options in the Upload screen's document-type picker. */
export const UPLOAD_DOCUMENT_TYPES: readonly string[] = [
  "Bank Statement",
  "Co-op Statement",
  "Mart Receipt",
  "DAFM Correspondence",
  "Invoice",
  "Payroll File",
  "Proof of Address",
  "Proof of Identity",
  "Other",
];

/** Upload types that trigger the Veriff identity check after upload. */
export const VERIFICATION_DOCUMENT_TYPES: readonly string[] = [
  "Proof of Address",
  "Proof of Identity",
];

export const UPLOADED_DOCS: UploadedDocument[] = [
  {
    id: 1,
    name: "Bank Statement - Jan 2025",
    type: "Bank Statement",
    date: "2025-02-03",
    status: "Pending review",
  },
  {
    id: 2,
    name: "Glanbia Co-op Statement",
    type: "Co-op Statement",
    date: "2025-01-28",
    status: "Categorised",
  },
  {
    id: 3,
    name: "Mart Receipt - Dec 2024",
    type: "Mart Receipt",
    date: "2025-01-15",
    status: "Pending review",
  },
  {
    id: 4,
    name: "DAFM Correspondence",
    type: "DAFM Correspondence",
    date: "2025-01-09",
    status: "Categorised",
  },
  {
    id: 5,
    name: "AIB Invoice - Feb",
    type: "Invoice",
    date: "2025-02-05",
    status: "Pending review",
  },
  {
    id: 6,
    name: "Payroll File - Feb 2025",
    type: "Payroll File",
    date: "2025-02-07",
    status: "Categorised",
  },
  {
    id: 7,
    name: "Bank Statement - Feb 2025",
    type: "Bank Statement",
    date: "2025-02-28",
    status: "Pending review",
  },
];

export const RECIPIENTS: Recipient[] = [
  { id: "office", label: "ifac Office", desc: "Kilkenny · your ifac team" },
  {
    id: "bookkeeper",
    label: "My Bookkeeper",
    desc: "Aoife Ryan · Ryan Bookkeeping",
  },
];

export const CURRENT_USER_NAME = "Michael O'Donoghue";

export const SAMPLE_ATTACHMENT: ThreadAttachment = {
  name: "Bank Statement Jan.pdf",
  size: "842 KB",
};
