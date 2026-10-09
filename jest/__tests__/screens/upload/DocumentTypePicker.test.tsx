import { fireEvent, screen } from "@testing-library/react-native";

import { Strings, UPLOAD_DOCUMENT_TYPES } from "../../../../src/constants";
import { DocumentTypePicker } from "../../../../src/screens/upload/components";
import { RenderWrapper } from "../../../Wrapper";

const selected = UPLOAD_DOCUMENT_TYPES[1];

describe("DocumentTypePicker", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <DocumentTypePicker
        selectedType={selected}
        types={UPLOAD_DOCUMENT_TYPES}
        onBack={jest.fn()}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("lists every type and marks the selected one", async () => {
    await RenderWrapper(
      <DocumentTypePicker
        selectedType={selected}
        types={UPLOAD_DOCUMENT_TYPES}
        onBack={jest.fn()}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(Strings.UploadScreen.selectDocumentType)).toBeOnTheScreen();
    UPLOAD_DOCUMENT_TYPES.forEach((type) => expect(screen.getByText(type)).toBeOnTheScreen());
    expect(screen.getByRole("button", { name: selected })).toBeSelected();
    expect(screen.getByRole("button", { name: UPLOAD_DOCUMENT_TYPES[0] })).not.toBeSelected();
  });

  it("calls onSelect with the pressed type", async () => {
    const onSelect = jest.fn();
    await RenderWrapper(
      <DocumentTypePicker
        selectedType={null}
        types={UPLOAD_DOCUMENT_TYPES}
        onBack={jest.fn()}
        onSelect={onSelect}
      />,
    );
    await fireEvent.press(screen.getByRole("button", { name: UPLOAD_DOCUMENT_TYPES[2] }));
    expect(onSelect).toHaveBeenCalledWith(UPLOAD_DOCUMENT_TYPES[2]);
  });

  it("calls onBack from the back button", async () => {
    const onBack = jest.fn();
    await RenderWrapper(
      <DocumentTypePicker
        selectedType={null}
        types={UPLOAD_DOCUMENT_TYPES}
        onBack={onBack}
        onSelect={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByRole("button", { name: Strings.Common.back }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
