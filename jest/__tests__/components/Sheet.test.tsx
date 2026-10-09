import { screen, userEvent } from "@testing-library/react-native";

import { AppText, Sheet } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

const title = Strings.Common.whoShouldSee;
const content = Strings.Common.takePhoto;

describe("Sheet", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <Sheet visible title={title} onClose={jest.fn()}>
        <AppText>{content}</AppText>
      </Sheet>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the title and children when visible", async () => {
    await RenderWrapper(
      <Sheet visible title={title} onClose={jest.fn()}>
        <AppText>{content}</AppText>
      </Sheet>,
    );
    expect(screen.getByText(title)).toBeOnTheScreen();
    expect(screen.getByText(content)).toBeOnTheScreen();
  });

  it("calls onClose when the backdrop is pressed", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    await RenderWrapper(
      <Sheet visible onClose={onClose}>
        <AppText>{content}</AppText>
      </Sheet>,
    );
    await user.press(screen.getByRole("button", { name: Strings.Common.close }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
