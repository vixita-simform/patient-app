import { fireEvent, screen } from "@testing-library/react-native";

import { DOCUMENTS, Strings } from "../../../../src/constants";
import { DocumentsScreen } from "../../../../src/screens";
import { PAGE_SIZE } from "../../../../src/screens/documents/useDocumentsScreen";
import { fillTemplate } from "../../../../src/utils";
import { RenderWrapper } from "../../../Wrapper";

const strings = Strings.DocumentsScreen;
const showing = (shown: number, total: number) =>
  fillTemplate(strings.showingCount, { shown, total });

describe("DocumentsScreen", () => {
  it("renders the title and the first page", async () => {
    await RenderWrapper(<DocumentsScreen />);
    expect(screen.getByText(strings.title)).toBeOnTheScreen();
    expect(screen.getByText(DOCUMENTS[0].name)).toBeOnTheScreen();
    expect(screen.queryByText(DOCUMENTS[PAGE_SIZE].name)).toBeNull();
    expect(screen.getByText(showing(PAGE_SIZE, DOCUMENTS.length))).toBeOnTheScreen();
  });

  it("does not render a download button while no download handler exists", async () => {
    await RenderWrapper(<DocumentsScreen />);
    expect(screen.queryByText(strings.download)).toBeNull();
  });

  it("filters the list when typing a query", async () => {
    await RenderWrapper(<DocumentsScreen />);
    const target = DOCUMENTS[PAGE_SIZE];
    await fireEvent.changeText(screen.getByPlaceholderText(strings.searchPlaceholder), target.name);
    expect(screen.getByText(target.name)).toBeOnTheScreen();
    expect(screen.queryByText(DOCUMENTS[0].name)).toBeNull();
  });

  it("filters by document type chip", async () => {
    await RenderWrapper(<DocumentsScreen />);
    const type = "Tax Return";
    const matching = DOCUMENTS.filter((d) => d.type === type);
    await fireEvent.press(screen.getByLabelText(type));
    expect(screen.getByLabelText(type)).toBeSelected();
    expect(screen.getByLabelText(strings.all)).not.toBeSelected();
    expect(
      screen.getByText(showing(Math.min(PAGE_SIZE, matching.length), matching.length)),
    ).toBeOnTheScreen();
    expect(screen.queryByText(DOCUMENTS.find((d) => d.type !== type)!.name)).toBeNull();
  });

  it("loads more documents and updates the showing count", async () => {
    await RenderWrapper(<DocumentsScreen />);
    const total = DOCUMENTS.length;
    const loadMore = fillTemplate(Strings.Common.loadMoreCount, { count: total - PAGE_SIZE });
    await fireEvent.press(screen.getByLabelText(loadMore));
    const shown = Math.min(PAGE_SIZE * 2, total);
    expect(screen.getByText(showing(shown, total))).toBeOnTheScreen();
    expect(screen.getByText(DOCUMENTS[PAGE_SIZE].name)).toBeOnTheScreen();
  });
});
