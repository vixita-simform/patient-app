import type { DocumentItem } from "../../types";

export interface UseDocumentsScreenReturn {
  query: string;
  year: string;
  years: string[];
  filter: string;
  filterOptions: string[];
  yearSheetVisible: boolean;
  filteredDocuments: DocumentItem[];
  shownDocuments: DocumentItem[];
  remainingCount: number;
  onChangeQuery: (value: string) => void;
  onOpenYearSheet: () => void;
  onCloseYearSheet: () => void;
  onSelectYear: (value: string) => void;
  onSelectFilter: (value: string) => void;
  onLoadMore: () => void;
}
