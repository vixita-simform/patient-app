import { screen, userEvent } from "@testing-library/react-native";

import { DateChip } from "../../../../src/screens/book-appointment/components";
import { RenderWrapper } from "../../../Wrapper";

const renderChip = (active: boolean, disabled: boolean, onPress = jest.fn()) =>
  RenderWrapper(
    <DateChip
      accessibilityLabel="Friday, 2 October"
      active={active}
      dayNumber="2"
      disabled={disabled}
      id="2026-10-02"
      weekday="Fri"
      onPress={onPress}
    />,
  );

describe("DateChip", () => {
  it.each([
    [false, false],
    [true, false],
    [false, true],
  ])("matches the snapshot when active=%p disabled=%p", async (active, disabled) => {
    await renderChip(active, disabled);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("marks the active chip selected", async () => {
    await renderChip(true, false);
    expect(screen.getByRole("button")).toBeSelected();
  });

  it("announces the full date", async () => {
    await renderChip(false, false);
    expect(screen.getByRole("button", { name: "Friday, 2 October" })).toBeOnTheScreen();
  });

  it("passes its id to onPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderChip(false, false, onPress);
    await user.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledWith("2026-10-02");
  });

  it("is disabled and ignores presses for a past day", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderChip(false, true, onPress);
    expect(screen.getByRole("button")).toBeDisabled();
    await user.press(screen.getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
