import { screen } from "@testing-library/react-native";
import { processColor } from "react-native";

import { Avatar } from "../../../src/components";
import { scale } from "../../../src/theme";
import { RenderWrapper } from "../../Wrapper";

const customColor = "#005670";

/** The gradient host view is the one carrying the `colors` prop. */
const getGradient = () => {
  const [gradient] = screen.container.queryAll((node) => Array.isArray(node.props.colors));
  return gradient;
};

describe("Avatar", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<Avatar initials="AP" />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the initials", async () => {
    await RenderWrapper(<Avatar initials="AP" />);
    expect(screen.getByText("AP")).toBeOnTheScreen();
  });

  it("sizes the circle from the size prop and starts the gradient at the given colour", async () => {
    await RenderWrapper(<Avatar color={customColor} initials="RM" size={44} />);
    expect(screen.getByText("RM")).toBeOnTheScreen();
    const gradient = getGradient();
    expect(gradient).toHaveStyle({
      width: scale(44),
      height: scale(44),
      borderRadius: scale(44) / 2,
    });
    // The native gradient receives processed (numeric) colours.
    expect(gradient.props.colors[0]).toBe(processColor(customColor));
  });
});
