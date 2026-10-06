import { screen, userEvent } from "@testing-library/react-native";

import { CustomButton } from "../../../src/components";
import { BUTTON_VARIANT } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

describe("CustomButton", () => {
  it("matches the snapshot for the fill variant", async () => {
    await RenderWrapper(<CustomButton label="Confirm booking" variant={BUTTON_VARIANT.fill} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("matches the snapshot for the line variant", async () => {
    await RenderWrapper(<CustomButton label="Cancel" variant={BUTTON_VARIANT.line} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("fires onPress when pressed", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<CustomButton label="Confirm booking" onPress={onPress} />);
    await user.press(screen.getByRole("button", { name: "Confirm booking" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<CustomButton disabled label="Confirm booking" onPress={onPress} />);
    await user.press(screen.getByRole("button", { name: "Confirm booking" }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
