import type { MessageThread } from "../../../../types";

export interface ThreadCardProps {
  thread: MessageThread;
  onPress: () => void;
}
