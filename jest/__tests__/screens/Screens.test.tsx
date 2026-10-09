import { screen } from "@testing-library/react-native";

import { Strings } from "../../../src/constants";
import {
  DocumentsScreen,
  HomeScreen,
  MessagesScreen,
  MoreScreen,
  UploadScreen,
} from "../../../src/screens";
import { RenderWrapper } from "../../Wrapper";

describe("tab screens", () => {
  it.each([
    ["HomeScreen", HomeScreen, Strings.HomeScreen.goodMorning],
    ["DocumentsScreen", DocumentsScreen, Strings.DocumentsScreen.title],
    ["UploadScreen", UploadScreen, Strings.UploadScreen.heading],
    ["MessagesScreen", MessagesScreen, Strings.MessagesScreen.title],
    ["MoreScreen", MoreScreen, Strings.MoreScreen.title],
  ])("%s renders its heading", async (_name, Component, heading) => {
    await RenderWrapper(<Component />);
    expect(screen.getByText(heading)).toBeOnTheScreen();
  });
});
