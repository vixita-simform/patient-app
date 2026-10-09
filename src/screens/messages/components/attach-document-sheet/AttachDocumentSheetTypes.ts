import type { Recipient, ThreadAttachment } from "../../../../types";

export type AttachStep = "source" | "recipients";

/** Where the attached document comes from. */
export type AttachSource = "camera" | "storage";

export interface AttachDocumentSheetProps {
  visible: boolean;
  step: AttachStep;
  attachment: ThreadAttachment;
  recipients: Recipient[];
  selected: string[];
  onChangeSelected: (ids: string[]) => void;
  onPickSource: (source: AttachSource) => void;
  onBack: () => void;
  onSend: () => void;
  onClose: () => void;
}
