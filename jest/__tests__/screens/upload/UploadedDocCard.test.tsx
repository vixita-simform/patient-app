import { fireEvent, screen } from "@testing-library/react-native";

import { Strings, UPLOADED_DOCS } from "../../../../src/constants";
import { UploadedDocCard } from "../../../../src/screens/upload/components";
import { fillTemplate } from "../../../../src/utils";
import { RenderWrapper } from "../../../Wrapper";

const doc = UPLOADED_DOCS[0];
const replaceLabel = fillTemplate(Strings.UploadScreen.replaceDocument, { name: doc.name });

describe("UploadedDocCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<UploadedDocCard doc={doc} onReplace={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the name and meta line", async () => {
    await RenderWrapper(<UploadedDocCard doc={doc} />);
    expect(screen.getByText(doc.name)).toBeOnTheScreen();
    expect(
      screen.getByText(`${doc.type}${Strings.Common.metaSeparator}${doc.date}`),
    ).toBeOnTheScreen();
  });

  it("hides Replace without onReplace", async () => {
    await RenderWrapper(<UploadedDocCard doc={doc} />);
    expect(screen.queryByText(Strings.UploadScreen.replace)).toBeNull();
  });

  it("calls onReplace with the document id", async () => {
    const onReplace = jest.fn();
    await RenderWrapper(<UploadedDocCard doc={doc} onReplace={onReplace} />);
    await fireEvent.press(screen.getByRole("button", { name: replaceLabel }));
    expect(onReplace).toHaveBeenCalledWith(doc.id);
  });
});
