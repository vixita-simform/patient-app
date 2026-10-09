import { screen, userEvent } from "@testing-library/react-native";

import { SectionHeader } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

const title = Strings.HomeScreen.recentDocuments;
const seeAll = Strings.HomeScreen.viewAll;

describe("SectionHeader", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <SectionHeader actionLabel={seeAll} title={title} onActionPress={jest.fn()} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows the action when both label and handler are given", async () => {
    const user = userEvent.setup();
    const onActionPress = jest.fn();
    await RenderWrapper(
      <SectionHeader actionLabel={seeAll} title={title} onActionPress={onActionPress} />,
    );
    expect(screen.getByText(title)).toBeOnTheScreen();
    await user.press(screen.getByRole("link", { name: seeAll }));
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it("hides the action without a handler", async () => {
    await RenderWrapper(<SectionHeader actionLabel={seeAll} title={title} />);
    expect(screen.getByText(title)).toBeOnTheScreen();
    expect(screen.queryByText(seeAll)).not.toBeOnTheScreen();
  });

  it("hides the action without a label", async () => {
    await RenderWrapper(<SectionHeader title={title} onActionPress={jest.fn()} />);
    expect(screen.queryByRole("link")).not.toBeOnTheScreen();
  });
});
