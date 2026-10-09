import { fireEvent, screen } from "@testing-library/react-native";

import { MESSAGES, Strings } from "../../../../src/constants";
import { ThreadHeader } from "../../../../src/screens/messages/components";
import { RenderWrapper } from "../../../Wrapper";

const [direct, group, closed] = MESSAGES;

describe("ThreadHeader", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<ThreadHeader thread={group} onBack={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows the topic and participant count", async () => {
    await RenderWrapper(<ThreadHeader thread={group} onBack={jest.fn()} />);
    expect(screen.getByText(group.topic)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${group.participants.length} ${Strings.MessagesScreen.participants}`,
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText(Strings.MessagesScreen.closed)).toBeNull();
  });

  it("shows the closed badge for a closed thread", async () => {
    await RenderWrapper(<ThreadHeader thread={closed} onBack={jest.fn()} />);
    expect(screen.getByText(Strings.MessagesScreen.closed)).toBeOnTheScreen();
  });

  it("calls onBack from the back button", async () => {
    const onBack = jest.fn();
    await RenderWrapper(<ThreadHeader thread={direct} onBack={onBack} />);
    await fireEvent.press(screen.getByLabelText(Strings.Common.back));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
