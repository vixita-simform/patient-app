import { screen } from "@testing-library/react-native";

import { Avatar } from "../../../src/components";
import { RenderWrapper } from "../../Wrapper";

describe("Avatar", () => {
  it("matches the snapshot with default tone and size", async () => {
    await RenderWrapper(<Avatar initials="AP" />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each(["navy", "green", "blue", "amber"] as const)(
    "renders initials with the %s tone",
    async (tone) => {
      await RenderWrapper(<Avatar initials="RM" size="compact" tone={tone} />);
      expect(screen.getByText("RM")).toBeOnTheScreen();
    },
  );

  it("renders a different container style for the compact size", async () => {
    await RenderWrapper(<Avatar initials="RM" size="compact" />);
    const compact = screen.getByText("RM").parent?.props.style;
    await RenderWrapper(<Avatar initials="RM" size="regular" />);
    const regular = screen.getByText("RM").parent?.props.style;
    expect(compact).not.toEqual(regular);
  });
});
