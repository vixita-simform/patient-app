import type { MessageThread } from "../../../../types";

export interface MessagePreviewCardProps {
  message: MessageThread;
  onPress: () => void;
}
