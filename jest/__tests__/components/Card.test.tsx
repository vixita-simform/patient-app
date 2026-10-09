import { screen, userEvent } from "@testing-library/react-native";

import { AppText, Card } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

const content = Strings.HomeScreen.recentDocuments;
const label = Strings.HomeScreen.viewAll;

describe("Card", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <Card>
        <AppText>{content}</AppText>
      </Card>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders a plain view without onPress", async () => {
    await RenderWrapper(
      <Card>
        <AppText>{content}</AppText>
      </Card>,
    );
    expect(screen.getByText(content)).toBeOnTheScreen();
    expect(screen.queryByRole("button")).not.toBeOnTheScreen();
  });

  it("renders a labelled button that fires onPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <Card accessibilityLabel={label} onPress={onPress}>
        <AppText>{content}</AppText>
      </Card>,
    );
    await user.press(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
