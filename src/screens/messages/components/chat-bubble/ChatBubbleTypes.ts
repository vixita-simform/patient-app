import type { Recipient, ThreadMessage } from "../../../../types";

export interface ChatBubbleProps {
  message: ThreadMessage;
  showSender: boolean;
  recipients: Recipient[];
}
