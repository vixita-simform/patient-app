import { screen, userEvent } from "@testing-library/react-native";

import { Chip } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

const label = Strings.FindADoctorScreen.cardiology;

describe("Chip", () => {
  it.each([true, false])("matches the snapshot when selected=%p", async (selected) => {
    await RenderWrapper(<Chip id="cardiology" label={label} selected={selected} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("marks the selected chip selected", async () => {
    await RenderWrapper(<Chip selected id="cardiology" label={label} onPress={jest.fn()} />);
    expect(screen.getByRole("button", { name: label })).toBeSelected();
  });

  it("leaves an unselected chip unselected", async () => {
    await RenderWrapper(<Chip id="cardiology" label={label} selected={false} onPress={jest.fn()} />);
    expect(screen.getByRole("button", { name: label })).not.toBeSelected();
  });

  it("passes its id to onPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<Chip id="cardiology" label={label} selected={false} onPress={onPress} />);
    await user.press(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledWith("cardiology");
  });
});
