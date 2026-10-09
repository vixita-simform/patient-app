import type { Recipient } from "../../types";

export interface RecipientPickerProps {
  recipients: Recipient[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export interface RecipientRowProps {
  recipient: Recipient;
  checked: boolean;
  /** Called with the recipient id when the row is pressed. */
  onToggle: (id: string) => void;
}
