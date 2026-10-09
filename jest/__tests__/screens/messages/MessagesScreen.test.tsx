import { fireEvent, screen } from "@testing-library/react-native";

import { MESSAGES, Strings } from "../../../../src/constants";
import { MessagesScreen } from "../../../../src/screens";
import { RenderWrapper } from "../../../Wrapper";

const [direct, , closed] = MESSAGES;
const cardLabel = (topic: string, from: string) =>
  `${topic}${Strings.Common.listSeparator}${from}`;

describe("MessagesScreen", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<MessagesScreen />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("opens a thread and returns to the list", async () => {
    await RenderWrapper(<MessagesScreen />);
    await fireEvent.press(screen.getByLabelText(cardLabel(direct.topic, direct.from)));
    expect(screen.getByText(direct.thread[0].text as string)).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(Strings.Common.back));
    expect(screen.getByText(Strings.MessagesScreen.title)).toBeOnTheScreen();
  });

  it("appends a sent message to the open thread", async () => {
    await RenderWrapper(<MessagesScreen />);
    await fireEvent.press(screen.getByLabelText(cardLabel(direct.topic, direct.from)));
    await fireEvent.changeText(
      screen.getByLabelText(Strings.MessagesScreen.typeMessage),
      "  New note  ",
    );
    await fireEvent.press(screen.getByLabelText(Strings.MessagesScreen.sendMessage));
    expect(screen.getByText("New note")).toBeOnTheScreen();
    expect(screen.getByText(Strings.Common.now)).toBeOnTheScreen();
  });

  it("shows the view-only notice instead of the composer for a closed thread", async () => {
    await RenderWrapper(<MessagesScreen />);
    await fireEvent.press(screen.getByLabelText(cardLabel(closed.topic, closed.from)));
    expect(screen.getByText(Strings.MessagesScreen.viewOnly)).toBeOnTheScreen();
    expect(screen.queryByLabelText(Strings.MessagesScreen.typeMessage)).toBeNull();
  });
});
