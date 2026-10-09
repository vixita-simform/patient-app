import type { DocumentItem } from "../../../../types";

export interface DocumentCardProps {
  document: DocumentItem;
  /** When omitted, the download button is not rendered. */
  onDownload?: (document: DocumentItem) => void;
}
