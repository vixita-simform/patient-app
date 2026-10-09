import { fireEvent, screen } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { StatCard } from "../../../../src/screens/home/components";
import { theme } from "../../../../src/theme";
import { RenderWrapper } from "../../../Wrapper";

const COLORS = [theme.colors.primary, theme.colors.primaryDark] as const;
const LABEL = Strings.HomeScreen.outstanding;
const CAPTION = Strings.HomeScreen.itemsNeedAttention;
const VALUE = 4;

describe("StatCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <StatCard caption={CAPTION} colors={COLORS} label={LABEL} value={VALUE} onPress={jest.fn()} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders label, value and caption with an accessible label", async () => {
    await RenderWrapper(
      <StatCard caption={CAPTION} colors={COLORS} label={LABEL} value={VALUE} onPress={jest.fn()} />,
    );
    expect(screen.getByText(LABEL)).toBeOnTheScreen();
    expect(screen.getByText(String(VALUE))).toBeOnTheScreen();
    expect(screen.getByText(CAPTION)).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: `${LABEL}${Strings.Common.listSeparator}${VALUE}` }),
    ).toBeOnTheScreen();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await RenderWrapper(
      <StatCard caption={CAPTION} colors={COLORS} label={LABEL} value={VALUE} onPress={onPress} />,
    );
    await fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
