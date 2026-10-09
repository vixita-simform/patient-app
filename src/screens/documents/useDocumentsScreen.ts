import { useCallback, useMemo, useState } from "react";

import { DOCUMENTS, DOCUMENT_TYPES } from "../../constants";
import type { UseDocumentsScreenReturn } from "./DocumentsScreenTypes";

export const ALL_FILTER = "All";
/** Number of documents revealed per page / Load More press. */
export const PAGE_SIZE = 4;

/**
 * Documents screen state: search, type and year filters, pagination, year sheet.
 * @returns {UseDocumentsScreenReturn} data and handlers for the screen.
 */
export default function useDocumentsScreen(): UseDocumentsScreenReturn {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(ALL_FILTER);
  const [filter, setFilter] = useState(ALL_FILTER);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [yearSheetVisible, setYearSheetVisible] = useState(false);

  const years = useMemo(
    () => [ALL_FILTER, ...Array.from(new Set(DOCUMENTS.map((d) => d.year))).sort().reverse()],
    [],
  );
  const filterOptions = useMemo(() => [ALL_FILTER, ...DOCUMENT_TYPES], []);

  const filteredDocuments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DOCUMENTS.filter(
      (d) =>
        (filter === ALL_FILTER || d.type === filter) &&
        (year === ALL_FILTER || d.year === year) &&
        (!needle ||
          d.name.toLowerCase().includes(needle) ||
          d.type.toLowerCase().includes(needle)),
    );
  }, [filter, year, query]);

  const shownDocuments = useMemo(
    () => filteredDocuments.slice(0, visible),
    [filteredDocuments, visible],
  );
  const remainingCount = Math.max(filteredDocuments.length - visible, 0);

  const onChangeQuery = useCallback((value: string) => {
    setQuery(value);
    setVisible(PAGE_SIZE);
  }, []);
  const onOpenYearSheet = useCallback(() => setYearSheetVisible(true), []);
  const onCloseYearSheet = useCallback(() => setYearSheetVisible(false), []);
  const onSelectYear = useCallback((value: string) => {
    setYear(value);
    setVisible(PAGE_SIZE);
    setYearSheetVisible(false);
  }, []);
  const onSelectFilter = useCallback((value: string) => {
    setFilter(value);
    setVisible(PAGE_SIZE);
  }, []);
  const onLoadMore = useCallback(() => setVisible((v) => v + PAGE_SIZE), []);

  return {
    query,
    year,
    years,
    filter,
    filterOptions,
    yearSheetVisible,
    filteredDocuments,
    shownDocuments,
    remainingCount,
    onChangeQuery,
    onOpenYearSheet,
    onCloseYearSheet,
    onSelectYear,
    onSelectFilter,
    onLoadMore,
  };
}
