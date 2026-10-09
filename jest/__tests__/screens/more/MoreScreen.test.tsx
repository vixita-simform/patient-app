import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { MORE_ITEMS, STACK_ROUTES, Strings } from "../../../../src/constants";
import { MoreScreen } from "../../../../src/screens";
import { RenderWrapper } from "../../../Wrapper";

describe("MoreScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("matches the snapshot", async () => {
    await RenderWrapper(<MoreScreen />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the header and every menu item", async () => {
    await RenderWrapper(<MoreScreen />);
    expect(screen.getByText(Strings.MoreScreen.title)).toBeOnTheScreen();
    expect(screen.getByText(Strings.MoreScreen.subtitle)).toBeOnTheScreen();
    MORE_ITEMS.forEach((item) => expect(screen.getByText(item.label)).toBeOnTheScreen());
  });

  it("hides Log Out until sign-out exists", async () => {
    await RenderWrapper(<MoreScreen />);
    expect(screen.queryByText(/log out/i)).toBeNull();
  });

  it("navigates to the item's stack route on press", async () => {
    const item = MORE_ITEMS[2];
    await RenderWrapper(<MoreScreen />);
    await fireEvent.press(screen.getByRole("button", { name: item.label }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES[item.id]);
  });
});
