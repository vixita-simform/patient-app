import { fireEvent, screen } from "@testing-library/react-native";

import { DOCUMENTS, Strings } from "../../../../src/constants";
import { DocumentCard } from "../../../../src/screens/documents/components";
import { fillTemplate } from "../../../../src/utils";
import { RenderWrapper } from "../../../Wrapper";

const doc = DOCUMENTS[0];
const separator = Strings.Common.metaSeparator;
const downloadLabel = fillTemplate(Strings.DocumentsScreen.downloadDocument, { name: doc.name });

describe("DocumentCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<DocumentCard document={doc} onDownload={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the name and meta lines", async () => {
    await RenderWrapper(<DocumentCard document={doc} />);
    expect(screen.getByText(doc.name)).toBeOnTheScreen();
    expect(screen.getByText(`${doc.type}${separator}${doc.year}`)).toBeOnTheScreen();
    expect(screen.getByText(`${doc.date}${separator}${doc.size}`)).toBeOnTheScreen();
  });

  it("hides the download button when no onDownload is passed", async () => {
    await RenderWrapper(<DocumentCard document={doc} />);
    expect(screen.queryByLabelText(downloadLabel)).toBeNull();
    expect(screen.queryByText(Strings.DocumentsScreen.download)).toBeNull();
  });

  it("calls onDownload with its document", async () => {
    const onDownload = jest.fn();
    await RenderWrapper(<DocumentCard document={doc} onDownload={onDownload} />);
    await fireEvent.press(screen.getByLabelText(downloadLabel));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(doc);
  });
});
