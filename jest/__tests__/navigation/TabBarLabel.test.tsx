import { screen } from "@testing-library/react-native";

import { Strings } from "../../../src/constants";
import { TabBarLabel } from "../../../src/navigation";
import { Colors, scale } from "../../../src/theme";
import { RenderWrapper } from "../../Wrapper";

const label = Strings.TabBar.home;
const activeColor = Colors.light.primary;

/** The active-tab dot is the only 3x3 view in the label. */
const queryDots = () =>
  screen.container.queryAll(
    (node) =>
      typeof node.type === "string" &&
      node.props.style?.width === scale(3) &&
      node.props.style?.height === scale(3),
  );

describe("TabBarLabel", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <TabBarLabel focused color={activeColor}>
        {label}
      </TabBarLabel>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows the dot and applies the tint colour when focused", async () => {
    await RenderWrapper(
      <TabBarLabel focused color={activeColor}>
        {label}
      </TabBarLabel>,
    );
    expect(screen.getByText(label)).toHaveStyle({ color: activeColor });
    expect(queryDots()).toHaveLength(1);
  });

  it("hides the dot when not focused", async () => {
    const inactiveColor = Colors.light.textSecondary;
    await RenderWrapper(
      <TabBarLabel color={inactiveColor} focused={false}>
        {label}
      </TabBarLabel>,
    );
    expect(screen.getByText(label)).toHaveStyle({ color: inactiveColor });
    expect(queryDots()).toHaveLength(0);
  });

  it("caps the label's font scaling", async () => {
    await RenderWrapper(
      <TabBarLabel focused color={activeColor}>
        {label}
      </TabBarLabel>,
    );
    expect(screen.getByText(label)).toHaveProp("maxFontSizeMultiplier", 1.3);
  });
});
