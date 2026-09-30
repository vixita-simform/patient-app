import { screen, userEvent } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { SpecialtyChip } from "../../../../src/screens/find-a-doctor/components";
import { RenderWrapper } from "../../../Wrapper";

const label = Strings.FindADoctorScreen.cardiology;

describe("SpecialtyChip", () => {
  it.each([true, false])("matches the snapshot when active=%p", async (active) => {
    await RenderWrapper(
      <SpecialtyChip active={active} id="cardiology" label={label} onPress={jest.fn()} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("marks the active chip selected", async () => {
    await RenderWrapper(
      <SpecialtyChip active id="cardiology" label={label} onPress={jest.fn()} />,
    );
    expect(screen.getByRole("button", { name: label })).toBeSelected();
  });

  it("leaves an inactive chip unselected", async () => {
    await RenderWrapper(
      <SpecialtyChip active={false} id="cardiology" label={label} onPress={jest.fn()} />,
    );
    expect(screen.getByRole("button", { name: label })).not.toBeSelected();
  });

  it("passes its id to onPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <SpecialtyChip active={false} id="cardiology" label={label} onPress={onPress} />,
    );
    await user.press(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledWith("cardiology");
  });
});
