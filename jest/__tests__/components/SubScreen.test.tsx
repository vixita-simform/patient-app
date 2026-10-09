import { screen, userEvent } from "@testing-library/react-native";

import { AppText, SubScreen } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

const title = Strings.MoreScreen.title;
const subtitle = Strings.MoreScreen.subtitle;
const content = Strings.FeatureScreen.comingSoon;

describe("SubScreen", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <SubScreen subtitle={subtitle} title={title} onBack={jest.fn()}>
        <AppText>{content}</AppText>
      </SubScreen>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the title, subtitle and children", async () => {
    await RenderWrapper(
      <SubScreen subtitle={subtitle} title={title} onBack={jest.fn()}>
        <AppText>{content}</AppText>
      </SubScreen>,
    );
    expect(screen.getByText(title)).toBeOnTheScreen();
    expect(screen.getByText(subtitle)).toBeOnTheScreen();
    expect(screen.getByText(content)).toBeOnTheScreen();
  });

  it("calls onBack when the back button is pressed", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    await RenderWrapper(
      <SubScreen subtitle={subtitle} title={title} onBack={onBack}>
        <AppText>{content}</AppText>
      </SubScreen>,
    );
    await user.press(screen.getByRole("button", { name: Strings.Common.back }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
