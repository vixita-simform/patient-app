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
  close: "Close",
  now: "Now",
  metaSeparator: " · ",
  listSeparator: ", ",
  takePhoto: "Take a photo",
  uploadFromStorage: "Upload from storage",
  whoShouldSee: "Who should see this?",
  /** Template: {count} is the number of items not yet shown. */
  loadMoreCount: "Load More ({count} more)",
});

const TabBar = freezeStringsObject({
  home: "Home",
  documents: "Docs",
  upload: "Upload",
  messages: "Messages",
  more: "More",
});

const HomeScreen = freezeStringsObject({
  title: "Home",
  goodMorning: "Good morning",
  switchClientCode: "Switch client code",
  switchClientCodeTitle: "Switch Client Code",
  notifications: "Notifications",
  outstanding: "Outstanding",
  itemsNeedAttention: "items need attention",
  availableToView: "available to view",
  awaitingSignature: "Documents awaiting signature",
  needYourSignature: "document(s) need your signature",
  recentDocuments: "Recent Documents",
  viewAll: "View All",
  yourTeam: "Your ifac Team",
});

const DocumentsScreen = freezeStringsObject({
  title: "Documents",
  subtitle: "Accounts, returns & certificates",
  searchPlaceholder: "Search documents...",
  filterByYear: "Filter by year",
  year: "Year",
  allYears: "All Years",
  all: "All",
  download: "Download",
  /** Template: {name} is the document name. */
  downloadDocument: "Download {name}",
  /** Template: {shown} of {total} documents. */
  showingCount: "Showing {shown} of {total}",
});

const UploadScreen = freezeStringsObject({
  title: "Upload",
  heading: "Upload Document",
  subtitle: "Capture or upload your documents",
  fileHint: "PDF, JPG, PNG, HEIC up to 25MB",
  documentTypeLabel: "Document type",
  selectDocumentType: "Select document type",
  categoriesConfirmed: "Categories are confirmed by your ifac team",
  veriffNotice: "Identity check via Veriff will start after upload.",
  submitDocument: "Submit Document",
  uploading: "Uploading...",
  securelySending: "Securely sending your document",
  documentUploaded: "Document uploaded",
  confirmCategory: "They'll confirm the category.",
  sentTo: "Sent to: ",
  uploadAnother: "Upload Another",
  previouslyUploaded: "Previously uploaded",
  replace: "Replace",
  /** Template: {name} is the document name. */
  replaceDocument: "Replace {name}",
});

const MessagesScreen = freezeStringsObject({
  title: "Messages",
  subtitle: "Secure chat with your ifac team",
  participants: "participants",
  closed: "Closed",
  closedBy: "This chat was closed by ifac on",
  viewOnly: "View only \u2014 replies are disabled",
  attachDocument: "Attach a document",
  uploadNote: "Uses the standard upload \u2014 also saved to Documents",
  sendTo: "Send to",
  recipientSingular: "recipient",
  recipientPlural: "recipients",
  selectRecipient: "Select a recipient",
  typeMessage: "Type a message...",
  sendMessage: "Send message",
  attachDocumentLabel: "Attach document",
  visibleTo: "Visible to",
});

const MoreScreen = freezeStringsObject({
  title: "More",
  subtitle: "All features & settings",
});

const MoreItems = freezeStringsObject({
  signingLabel: "Document Signing",
  signingDesc: "Sign electronically",
  amlLabel: "Identity Verification",
  amlDesc: "AML & KYC status",
  invoicesLabel: "Invoices & Payments",
  invoicesDesc: "View & pay invoices",
  meetingsLabel: "Meetings & Calls",
  meetingsDesc: "Book & manage meetings",
  checklistLabel: "Outstanding Items",
  checklistDesc: "Documents checklist",
  teamLabel: "Your ifac Team",
  teamDesc: "Your assigned advisors",
  servicesLabel: "ifac Services",
  servicesDesc: "Our full range",
  datafeedsLabel: "Data Feeds",
  datafeedsDesc: "Co-op & mart integrations",
  linksLabel: "Quick Links",
  linksDesc: "FarmPro, Bright & more",
  notificationsLabel: "Notifications",
  notificationsDesc: "All notifications",
  profileLabel: "Profile & Preferences",
  profileDesc: "Notifications, security & comms",
  helpLabel: "Help & Support",
  helpDesc: "FAQs & guides",
});

const FeatureScreen = freezeStringsObject({
  comingSoon: "Coming soon",
  comingSoonBody: "This section is on its way. Check back after the next update.",
});

const RecipientPicker = freezeStringsObject({
  /** Template: {name} is the single recipient. */
  sharedWith: "Shared with {name}",
  hintSelected: "Only the people you tick can see this document.",
  hintEmpty: "Select at least one recipient to continue.",
});

export default Object.freeze({
  RecipientPicker,
  Common,
  TabBar,
  HomeScreen,
  DocumentsScreen,
  UploadScreen,
  MessagesScreen,
  MoreScreen,
  MoreItems,
  FeatureScreen,
});
