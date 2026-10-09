import type {
  ClientCode,
  DocumentItem,
  HomeSummary,
  MessageThread,
  TeamMember,
} from "../../types";

export interface UseHomeScreenReturn {
  client: ClientCode;
  clientCodes: ClientCode[];
  showClientSwitch: boolean;
  ccOpen: boolean;
  unreadCount: number;
  recentDocuments: DocumentItem[];
  recentMessages: MessageThread[];
  documentCount: number;
  summary: HomeSummary;
  team: TeamMember[];
  onOpenClientSheet: () => void;
  onCloseClientSheet: () => void;
  onSelectClient: (client: ClientCode) => void;
  onPressNotifications: () => void;
  onPressOutstanding: () => void;
  onPressDocuments: () => void;
  onPressSigning: () => void;
  onPressMessages: () => void;
  onPressTeam: () => void;
}
