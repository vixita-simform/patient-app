import type { UploadedDocument } from "../../types";

export interface UseUploadScreenReturn {
  picking: boolean;
  selectedType: string | null;
  uploading: boolean;
  done: boolean;
  recips: string[];
  isVerification: boolean;
  canSubmit: boolean;
  visibleDocs: UploadedDocument[];
  remainingCount: number;
  recipientLabels: string;
  setRecips: (ids: string[]) => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelectType: (type: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onLoadMore: () => void;
}
