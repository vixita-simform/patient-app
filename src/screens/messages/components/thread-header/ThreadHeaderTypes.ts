import type { MessageThread } from "../../../../types";

export interface ThreadHeaderProps {
  thread: MessageThread;
  onBack: () => void;
}
