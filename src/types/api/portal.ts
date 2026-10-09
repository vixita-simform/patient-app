export interface ClientCode {
  code: string;
  name: string;
  farm: string;
}

export type DocumentStatus = "Completed" | "Under review";

export type UploadedDocumentStatus = "Pending review" | "Categorised";

export type TeamRole = "Accountant" | "Tax Advisor" | "Payroll" | "Financial Advisor";

export interface DocumentItem {
  id: number;
  name: string;
  type: string;
  year: string;
  /** ISO date, e.g. 2025-01-15 */
  date: string;
  status: DocumentStatus;
  size: string;
}

export interface ThreadAttachment {
  name: string;
  size: string;
}

export interface ThreadMessage {
  id: string;
  sender: string;
  staff: boolean;
  text?: string;
  attachment?: ThreadAttachment;
  /** Recipient ids an attachment is visible to. */
  recipients?: string[];
  time: string;
}

export interface MessageThread {
  id: number;
  topic: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
  closed: boolean;
  closedDate?: string;
  participants: string[];
  thread: ThreadMessage[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: TeamRole;
  /** Initials */
  img: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface HomeSummary {
  outstandingCount: number;
  pendingSignatureCount: number;
}

export interface Recipient {
  id: string;
  label: string;
  desc: string;
}

export type MoreItemId =
  | "signing"
  | "aml"
  | "invoices"
  | "meetings"
  | "checklist"
  | "team"
  | "services"
  | "datafeeds"
  | "links"
  | "notifications"
  | "profile"
  | "help";

export type MoreItemIcon =
  | "pen"
  | "shield"
  | "invoice"
  | "calendar"
  | "checklist"
  | "team"
  | "services"
  | "data"
  | "link"
  | "bell"
  | "settings"
  | "help";

export interface MoreItem {
  id: MoreItemId;
  label: string;
  icon: MoreItemIcon;
  desc: string;
}

export interface UploadedDocument {
  id: number;
  name: string;
  type: string;
  date: string;
  status: UploadedDocumentStatus;
}
