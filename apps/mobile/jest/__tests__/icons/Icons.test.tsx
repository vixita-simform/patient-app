import { screen } from "@testing-library/react-native";
import type { ComponentType } from "react";

import * as Icons from "../../../src/assets/icons";
import { RenderWrapper } from "../../Wrapper";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const iconEntries = Object.entries(Icons) as [string, ComponentType<IconProps>][];

describe("icons", () => {
  it("exports icons", () => {
    expect(iconEntries.length).toBeGreaterThan(0);
  });

  it.each(iconEntries)("%s renders with defaults", async (_name, Icon) => {
    await RenderWrapper(<Icon />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each(iconEntries)("%s applies the size prop", async (_name, Icon) => {
    await RenderWrapper(<Icon size={32} />);
    const [svg] = screen.container.queryAll((node) => node.props.width === 32);
    expect(svg).toBeDefined();
  });
});
