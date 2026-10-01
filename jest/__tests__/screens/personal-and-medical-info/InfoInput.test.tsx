import { screen, userEvent } from "@testing-library/react-native";

import { InfoInput } from "../../../../src/screens/personal-and-medical-info/components";
import { RenderWrapper } from "../../../Wrapper";

const LABEL = "Full name";

describe("InfoInput", () => {
  describe("editable", () => {
    it("labels the text input and reports edits", async () => {
      const user = userEvent.setup();
      const onChangeText = jest.fn();
      await RenderWrapper(
        <InfoInput accessibilityLabel={LABEL} trailingText="98250 11223" value="" onChangeText={onChangeText} />,
      );
      const input = screen.getByLabelText(LABEL);
      expect(input).toBeEnabled();
      expect(screen.queryByRole("button")).not.toBeOnTheScreen();
      expect(screen.getByText("98250 11223")).toBeOnTheScreen();
      await user.type(input, "A");
      expect(onChangeText).toHaveBeenCalledWith("A");
    });
  });

  describe("pressable", () => {
    it("labels only the button and opens on press", async () => {
      const user = userEvent.setup();
      const onPress = jest.fn();
      await RenderWrapper(<InfoInput accessibilityLabel={LABEL} value="14 Mar 1992" onPress={onPress} />);
      expect(screen.getAllByLabelText(LABEL)).toHaveLength(1);
      const button = screen.getByRole("button", { name: LABEL });
      expect(button).toHaveAccessibilityValue({ text: "14 Mar 1992" });
      await user.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("keeps the inner input read-only", async () => {
      await RenderWrapper(<InfoInput accessibilityLabel={LABEL} value="14 Mar 1992" onPress={jest.fn()} />);
      expect(screen.getByDisplayValue("14 Mar 1992", { includeHiddenElements: true }).props.editable).toBe(false);
    });
  });
});
