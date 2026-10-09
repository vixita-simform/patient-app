import { screen } from "@testing-library/react-native";

import { StatusBadge } from "../../../src/components";
import { RenderWrapper } from "../../Wrapper";

const label = "Today";

describe("StatusBadge", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<StatusBadge label={label} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders its label", async () => {
    await RenderWrapper(<StatusBadge label={label} />);
    expect(screen.getByText(label)).toBeOnTheScreen();
  });
});
