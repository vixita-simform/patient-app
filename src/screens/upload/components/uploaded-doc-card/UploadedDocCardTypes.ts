import type { UploadedDocument } from "../../../../types";

export interface UploadedDocCardProps {
  doc: UploadedDocument;
  /** Renders the Replace action when provided; called with the document id. */
  onReplace?: (id: number) => void;
}
