import { act } from "@testing-library/react-native";

import {
  RECIPIENTS,
  Strings,
  UPLOADED_DOCS,
  VERIFICATION_DOCUMENT_TYPES,
} from "../../../src/constants";
import useUploadScreen, {
  DEFAULT_RECIPIENTS,
  PAGE_SIZE,
  UPLOAD_DELAY_MS,
} from "../../../src/screens/upload/useUploadScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

const setup = () => RenderWrapperForHooks(() => useUploadScreen());

describe("useUploadScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("starts on the form with default recipients", async () => {
    const { result } = await setup();
    expect(result.current.picking).toBe(false);
    expect(result.current.selectedType).toBeNull();
    expect(result.current.recips).toEqual(DEFAULT_RECIPIENTS);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isVerification).toBe(false);
  });

  it("opens and closes the picker", async () => {
    const { result } = await setup();
    await act(() => result.current.onOpenPicker());
    expect(result.current.picking).toBe(true);
    await act(() => result.current.onClosePicker());
    expect(result.current.picking).toBe(false);
  });

  it("selecting a type closes the picker and enables submit", async () => {
    const { result } = await setup();
    await act(() => result.current.onOpenPicker());
    await act(() => result.current.onSelectType("Invoice"));
    expect(result.current.selectedType).toBe("Invoice");
    expect(result.current.picking).toBe(false);
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.isVerification).toBe(false);
  });

  it("cannot submit without recipients", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectType("Invoice"));
    await act(() => result.current.setRecips([]));
    expect(result.current.canSubmit).toBe(false);
  });

  it.each(VERIFICATION_DOCUMENT_TYPES.map((t) => [t]))("flags %s as verification", async (t) => {
    const { result } = await setup();
    await act(() => result.current.onSelectType(t));
    expect(result.current.isVerification).toBe(true);
  });

  it("simulates the upload, then reset restores the form", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectType("Invoice"));
    await act(() => result.current.setRecips(["bookkeeper"]));
    await act(() => result.current.onSubmit());
    expect(result.current.uploading).toBe(true);
    expect(result.current.done).toBe(false);
    await act(() => jest.advanceTimersByTime(UPLOAD_DELAY_MS - 1));
    expect(result.current.uploading).toBe(true);
    await act(() => jest.advanceTimersByTime(1));
    expect(result.current.uploading).toBe(false);
    expect(result.current.done).toBe(true);
    await act(() => result.current.onReset());
    expect(result.current.done).toBe(false);
    expect(result.current.selectedType).toBeNull();
    expect(result.current.recips).toEqual(DEFAULT_RECIPIENTS);
  });

  it("pages the uploaded documents", async () => {
    const { result } = await setup();
    expect(result.current.visibleDocs).toEqual(UPLOADED_DOCS.slice(0, PAGE_SIZE));
    expect(result.current.remainingCount).toBe(Math.max(0, UPLOADED_DOCS.length - PAGE_SIZE));
    await act(() => result.current.onLoadMore());
    expect(result.current.visibleDocs).toHaveLength(Math.min(PAGE_SIZE * 2, UPLOADED_DOCS.length));
    await act(() => result.current.onLoadMore());
    await act(() => result.current.onLoadMore());
    expect(result.current.remainingCount).toBe(0);
  });

  it("joins recipient labels with the list separator", async () => {
    const { result } = await setup();
    expect(result.current.recipientLabels).toBe(RECIPIENTS[0].label);
    await act(() => result.current.setRecips(RECIPIENTS.map((r) => r.id)));
    expect(result.current.recipientLabels).toBe(
      RECIPIENTS.map((r) => r.label).join(Strings.Common.listSeparator),
    );
  });
});
