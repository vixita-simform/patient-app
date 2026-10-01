import { screen, userEvent } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { EditableAvatar } from "../../../../src/screens/personal-and-medical-info/components";
import { RenderWrapper } from "../../../Wrapper";

const { editPhoto } = Strings.PersonalAndMedicalInfoScreen;

describe("EditableAvatar", () => {
  it("renders the initials", async () => {
    await RenderWrapper(<EditableAvatar accessibilityLabel={editPhoto} initials="AP" onPress={jest.fn()} />);
    expect(screen.getByText("AP")).toBeOnTheScreen();
  });

  it("calls onPress from the labelled pen button", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<EditableAvatar accessibilityLabel={editPhoto} initials="AP" onPress={onPress} />);
    await user.press(screen.getByRole("button", { name: editPhoto }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
