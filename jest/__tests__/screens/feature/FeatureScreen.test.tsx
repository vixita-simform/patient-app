import { screen, userEvent } from "@testing-library/react-native";
import { router, usePathname } from "expo-router";

import { STACK_ROUTES, Strings } from "../../../../src/constants";
import { FeatureScreen } from "../../../../src/screens";
import { RenderWrapper } from "../../../Wrapper";

const mockedUsePathname = usePathname as jest.Mock;

describe("FeatureScreen", () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue(STACK_ROUTES.team);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("matches the snapshot", async () => {
    await RenderWrapper(<FeatureScreen />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("titles the screen after the matching More item and shows the coming-soon body", async () => {
    await RenderWrapper(<FeatureScreen />);
    expect(screen.getByText(Strings.MoreItems.teamLabel)).toBeOnTheScreen();
    expect(screen.getByText(Strings.MoreItems.teamDesc)).toBeOnTheScreen();
    expect(screen.getByText(Strings.FeatureScreen.comingSoon)).toBeOnTheScreen();
    expect(screen.getByText(Strings.FeatureScreen.comingSoonBody)).toBeOnTheScreen();
  });

  it("goes back when the back button is pressed", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<FeatureScreen />);
    await user.press(screen.getByRole("button", { name: Strings.Common.back }));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
