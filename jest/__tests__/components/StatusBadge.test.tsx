import { screen } from "@testing-library/react-native";

import { StatusBadge } from "../../../src/components";
import { STATUS_BADGE_TONE, Strings } from "../../../src/constants";
import { Colors } from "../../../src/theme";
import { RenderWrapper } from "../../Wrapper";

describe("StatusBadge", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<StatusBadge label={Strings.HomeScreen.today} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders its label", async () => {
    await RenderWrapper(<StatusBadge label={Strings.DoctorProfileScreen.insuranceAccepted} />);
    expect(screen.getByText(Strings.DoctorProfileScreen.insuranceAccepted)).toBeOnTheScreen();
  });

  it.each([
    [STATUS_BADGE_TONE.amber, Colors.light.amberSoft, Colors.light.amberInk],
    [STATUS_BADGE_TONE.coral, Colors.light.coralSoft, Colors.light.coralInk],
  ])("applies the %s tone colours", async (tone, background, text) => {
    await RenderWrapper(<StatusBadge label={Strings.HomeScreen.today} tone={tone} />);
    expect(screen.getByText(Strings.HomeScreen.today)).toHaveStyle({ color: text });
    const [badge] = screen.container.queryAll((node) => node.type === "View");
    expect(badge).toHaveStyle({
      backgroundColor: background,
    });
  });

  it.each([STATUS_BADGE_TONE.amber, STATUS_BADGE_TONE.coral])(
    "matches the snapshot for the %s tone",
    async (tone) => {
      await RenderWrapper(<StatusBadge label={Strings.HomeScreen.today} tone={tone} />);
      expect(screen.toJSON()).toMatchSnapshot();
    },
  );
});
