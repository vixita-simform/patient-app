import type { RefObject } from "react";
import type { ScrollView } from "react-native";

import type { MessageThread, ThreadMessage } from "../../types";
import type { AttachSource, AttachStep } from "./components";

export interface UseMessagesScreenReturn {
  threads: MessageThread[];
  selectedThread: MessageThread | undefined;
  isGroup: boolean;
  threadMessages: ThreadMessage[];
  message: string;
  attachOpen: boolean;
  attachStep: AttachStep;
  attachRecipients: string[];
  listRef: RefObject<ScrollView | null>;
  onSelectThread: (id: number) => void;
  onCloseThread: () => void;
  onChangeMessage: (text: string) => void;
  onToggleAttach: () => void;
  onCloseAttach: () => void;
  onPickSource: (source: AttachSource) => void;
  onBackToSource: () => void;
  onChangeRecipients: (ids: string[]) => void;
  onSendAttachment: () => void;
  onPressSend: () => void;
  onContentSizeChange: () => void;
}
