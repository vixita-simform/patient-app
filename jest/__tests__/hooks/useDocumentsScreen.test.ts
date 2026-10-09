import { act } from "@testing-library/react-native";

import { DOCUMENTS, DOCUMENT_TYPES } from "../../../src/constants";
import useDocumentsScreen, {
  ALL_FILTER,
  PAGE_SIZE,
} from "../../../src/screens/documents/useDocumentsScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

const setup = () => RenderWrapperForHooks(() => useDocumentsScreen());

describe("useDocumentsScreen", () => {
  it("starts with all documents and the first page shown", async () => {
    const { result } = await setup();
    expect(result.current.filteredDocuments).toHaveLength(DOCUMENTS.length);
    expect(result.current.shownDocuments).toHaveLength(Math.min(PAGE_SIZE, DOCUMENTS.length));
    expect(result.current.remainingCount).toBe(Math.max(DOCUMENTS.length - PAGE_SIZE, 0));
    expect(result.current.filterOptions).toEqual([ALL_FILTER, ...DOCUMENT_TYPES]);
  });

  it("lists years sorted descending with All first", async () => {
    const { result } = await setup();
    const expected = Array.from(new Set(DOCUMENTS.map((d) => d.year))).sort().reverse();
    expect(result.current.years).toEqual([ALL_FILTER, ...expected]);
  });

  it("filters by document type", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectFilter("VAT Return"));
    expect(result.current.filter).toBe("VAT Return");
    expect(result.current.filteredDocuments.length).toBeGreaterThan(0);
    expect(result.current.filteredDocuments.every((d) => d.type === "VAT Return")).toBe(true);
  });

  it("filters by query case-insensitively on name and type", async () => {
    const { result } = await setup();
    await act(() => result.current.onChangeQuery("  annual ACCOUNTS "));
    const expected = DOCUMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes("annual accounts") ||
        d.type.toLowerCase().includes("annual accounts"),
    );
    expect(result.current.filteredDocuments).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
  });

  it("filters by year and closes the year sheet", async () => {
    const { result } = await setup();
    await act(() => result.current.onOpenYearSheet());
    expect(result.current.yearSheetVisible).toBe(true);
    await act(() => result.current.onSelectYear("2023"));
    expect(result.current.year).toBe("2023");
    expect(result.current.yearSheetVisible).toBe(false);
    expect(result.current.filteredDocuments.every((d) => d.year === "2023")).toBe(true);
  });

  it("opens and closes the year sheet", async () => {
    const { result } = await setup();
    expect(result.current.yearSheetVisible).toBe(false);
    await act(() => result.current.onOpenYearSheet());
    expect(result.current.yearSheetVisible).toBe(true);
    await act(() => result.current.onCloseYearSheet());
    expect(result.current.yearSheetVisible).toBe(false);
  });

  it("reveals another page on load more", async () => {
    const { result } = await setup();
    await act(() => result.current.onLoadMore());
    expect(result.current.shownDocuments).toHaveLength(Math.min(PAGE_SIZE * 2, DOCUMENTS.length));
    expect(result.current.remainingCount).toBe(Math.max(DOCUMENTS.length - PAGE_SIZE * 2, 0));
  });

  it.each([
    ["query", (r: ReturnType<typeof useDocumentsScreen>) => r.onChangeQuery("")],
    ["filter", (r: ReturnType<typeof useDocumentsScreen>) => r.onSelectFilter(ALL_FILTER)],
    ["year", (r: ReturnType<typeof useDocumentsScreen>) => r.onSelectYear(ALL_FILTER)],
  ])("resets pagination to PAGE_SIZE when the %s changes", async (_name, change) => {
    const { result } = await setup();
    await act(() => result.current.onLoadMore());
    expect(result.current.shownDocuments.length).toBeGreaterThan(PAGE_SIZE);
    await act(() => change(result.current));
    expect(result.current.shownDocuments).toHaveLength(PAGE_SIZE);
  });
});
