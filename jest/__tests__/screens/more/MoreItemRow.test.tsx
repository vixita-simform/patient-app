import { fireEvent, screen } from "@testing-library/react-native";

import { MORE_ITEMS } from "../../../../src/constants";
import { MoreItemRow } from "../../../../src/screens/more/components";
import { RenderWrapper } from "../../../Wrapper";

const item = MORE_ITEMS[0];

describe("MoreItemRow", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<MoreItemRow item={item} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the label and description", async () => {
    await RenderWrapper(<MoreItemRow item={item} onPress={jest.fn()} />);
    expect(screen.getByText(item.label)).toBeOnTheScreen();
    expect(screen.getByText(item.desc)).toBeOnTheScreen();
  });

  it("calls onPress with the item id", async () => {
    const onPress = jest.fn();
    await RenderWrapper(<MoreItemRow item={item} onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: item.label }));
    expect(onPress).toHaveBeenCalledWith(item.id);
  });
});
