import { screen } from "@testing-library/react-native";

import { CustomText, Screen } from "../../../src/components";
import { RenderWrapper } from "../../Wrapper";

describe("Screen", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <Screen>
        <CustomText>Content</CustomText>
      </Screen>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders its children", async () => {
    await RenderWrapper(
      <Screen>
        <CustomText>Content</CustomText>
      </Screen>,
    );
    expect(screen.getByText("Content")).toBeOnTheScreen();
  });
});
