import { fireEvent, screen } from "@testing-library/react-native";

import { MESSAGES, Strings } from "../../../../src/constants";
import { ThreadCard } from "../../../../src/screens/messages/components";
import { RenderWrapper } from "../../../Wrapper";

const [direct, group, closed] = MESSAGES;

describe("ThreadCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<ThreadCard thread={direct} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders a direct thread and calls onPress", async () => {
    const onPress = jest.fn();
    await RenderWrapper(<ThreadCard thread={direct} onPress={onPress} />);
    expect(screen.getByText(direct.topic)).toBeOnTheScreen();
    expect(screen.getByText(direct.from)).toBeOnTheScreen();
    expect(screen.getByText(direct.preview)).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByLabelText(`${direct.topic}${Strings.Common.listSeparator}${direct.from}`),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("lists other participants and the count for a group thread", async () => {
    await RenderWrapper(<ThreadCard thread={group} onPress={jest.fn()} />);
    expect(screen.getByText("Conor O'Brien, Declan Kelly")).toBeOnTheScreen();
    expect(screen.getByText(String(group.participants.length))).toBeOnTheScreen();
  });

  it("shows the closed badge for a closed thread", async () => {
    await RenderWrapper(<ThreadCard thread={closed} onPress={jest.fn()} />);
    expect(screen.getByText(Strings.MessagesScreen.closed)).toBeOnTheScreen();
  });
});
