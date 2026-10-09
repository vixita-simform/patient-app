import { screen } from "@testing-library/react-native";

import { RECIPIENTS, Strings } from "../../../../src/constants";
import { ChatBubble } from "../../../../src/screens/messages/components";
import type { ThreadMessage } from "../../../../src/types";
import { RenderWrapper } from "../../../Wrapper";

const textMessage: ThreadMessage = {
  id: "t1",
  sender: "Sarah Murphy",
  staff: true,
  text: "Hello there",
  time: "10:30 AM",
};

const attachmentMessage: ThreadMessage = {
  id: "a1",
  sender: "Michael O'Donoghue",
  staff: false,
  attachment: { name: "Contract.pdf", size: "1.2 MB" },
  recipients: ["office", "unknown-id"],
  time: "10:32 AM",
};

describe("ChatBubble", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <ChatBubble showSender message={textMessage} recipients={RECIPIENTS} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders a text bubble with sender and time", async () => {
    await RenderWrapper(
      <ChatBubble showSender message={textMessage} recipients={RECIPIENTS} />,
    );
    expect(screen.getByText("Hello there")).toBeOnTheScreen();
    expect(screen.getByText("Sarah Murphy")).toBeOnTheScreen();
    expect(screen.getByText("10:30 AM")).toBeOnTheScreen();
  });

  it("hides the sender when showSender is false", async () => {
    await RenderWrapper(
      <ChatBubble message={textMessage} recipients={RECIPIENTS} showSender={false} />,
    );
    expect(screen.queryByText("Sarah Murphy")).toBeNull();
  });

  it("renders an attachment with known recipient chips and drops unknown ids", async () => {
    await RenderWrapper(
      <ChatBubble
        message={attachmentMessage}
        recipients={RECIPIENTS}
        showSender={false}
      />,
    );
    expect(screen.getByText("Contract.pdf")).toBeOnTheScreen();
    expect(screen.getByText("1.2 MB")).toBeOnTheScreen();
    expect(screen.getByText(Strings.MessagesScreen.visibleTo)).toBeOnTheScreen();
    expect(screen.getByText(RECIPIENTS[0].label)).toBeOnTheScreen();
    expect(screen.queryByText("unknown-id")).toBeNull();
  });

  it("omits the chip row when no recipient id is known", async () => {
    await RenderWrapper(
      <ChatBubble
        message={{ ...attachmentMessage, recipients: ["unknown-id"] }}
        recipients={RECIPIENTS}
        showSender={false}
      />,
    );
    expect(screen.queryByText(Strings.MessagesScreen.visibleTo)).toBeNull();
  });

  it("renders nothing for a message without text or attachment", async () => {
    await RenderWrapper(
      <ChatBubble
        message={{ id: "e1", sender: "X", staff: true, time: "1:00 PM" }}
        recipients={RECIPIENTS}
        showSender={false}
      />,
    );
    expect(screen.queryByText("1:00 PM")).toBeNull();
  });
});
