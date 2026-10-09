import { act, fireEvent, screen } from "@testing-library/react-native";

import { Strings, UPLOADED_DOCS, UPLOAD_DOCUMENT_TYPES } from "../../../../src/constants";
import { UploadScreen } from "../../../../src/screens";
import { PAGE_SIZE, UPLOAD_DELAY_MS } from "../../../../src/screens/upload/useUploadScreen";
import { fillTemplate } from "../../../../src/utils";
import { RenderWrapper } from "../../../Wrapper";

const strings = Strings.UploadScreen;
const type = UPLOAD_DOCUMENT_TYPES[0];

describe("UploadScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("matches the snapshot", async () => {
    await RenderWrapper(<UploadScreen />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("disables Submit until a type is chosen", async () => {
    await RenderWrapper(<UploadScreen />);
    expect(screen.getByRole("button", { name: strings.submitDocument })).toBeDisabled();
  });

  it("opens the type picker from a source tile and goes back", async () => {
    await RenderWrapper(<UploadScreen />);
    await fireEvent.press(screen.getByRole("button", { name: Strings.Common.takePhoto }));
    expect(screen.getByText(strings.categoriesConfirmed)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: Strings.Common.back }));
    expect(screen.getByText(strings.heading)).toBeOnTheScreen();
  });

  it("selects a type, submits, and shows the success card", async () => {
    await RenderWrapper(<UploadScreen />);
    await fireEvent.press(screen.getByRole("button", { name: strings.selectDocumentType }));
    await fireEvent.press(screen.getByRole("button", { name: type }));
    expect(screen.getByRole("button", { name: type })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: strings.submitDocument }));
    expect(screen.getByText(strings.uploading)).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(UPLOAD_DELAY_MS));
    expect(screen.getByText(strings.documentUploaded)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: strings.uploadAnother }));
    expect(screen.getByRole("button", { name: strings.selectDocumentType })).toBeOnTheScreen();
  });

  it("shows the verification notice for verification types", async () => {
    await RenderWrapper(<UploadScreen />);
    await fireEvent.press(screen.getByRole("button", { name: strings.selectDocumentType }));
    await fireEvent.press(screen.getByRole("button", { name: "Proof of Identity" }));
    expect(screen.getByText(strings.veriffNotice)).toBeOnTheScreen();
  });

  it("loads more previously uploaded documents", async () => {
    await RenderWrapper(<UploadScreen />);
    const remaining = UPLOADED_DOCS.length - PAGE_SIZE;
    expect(screen.queryByText(UPLOADED_DOCS[PAGE_SIZE].name)).toBeNull();
    await fireEvent.press(
      screen.getByRole("button", {
        name: fillTemplate(Strings.Common.loadMoreCount, { count: remaining }),
      }),
    );
    expect(screen.getByText(UPLOADED_DOCS[PAGE_SIZE].name)).toBeOnTheScreen();
  });

  it("does not offer Replace while replacement upload is unavailable", async () => {
    await RenderWrapper(<UploadScreen />);
    expect(screen.queryByText(strings.replace)).toBeNull();
  });
});
