import { fireEvent, screen } from "@testing-library/react-native";

import { CameraIcon } from "../../../../src/assets/icons";
import { Strings } from "../../../../src/constants";
import { UploadSourceTile } from "../../../../src/screens/upload/components";
import { RenderWrapper } from "../../../Wrapper";

const label = Strings.Common.takePhoto;

describe("UploadSourceTile", () => {
  it.each(["green", "teal"] as const)("matches the snapshot for the %s tone", async (tone) => {
    await RenderWrapper(
      <UploadSourceTile icon={<CameraIcon />} label={label} tone={tone} onPress={jest.fn()} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the label and calls onPress", async () => {
    const onPress = jest.fn();
    await RenderWrapper(
      <UploadSourceTile icon={<CameraIcon />} label={label} tone="green" onPress={onPress} />,
    );
    expect(screen.getByText(label)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
