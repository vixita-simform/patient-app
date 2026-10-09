import { fireEvent, screen } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { ChatComposer } from "../../../../src/screens/messages/components";
import { RenderWrapper } from "../../../Wrapper";

const renderComposer = (attachActive = false) => {
  const handlers = {
    onChangeText: jest.fn(),
    onPressAttach: jest.fn(),
    onPressSend: jest.fn(),
  };
  return RenderWrapper(
    <ChatComposer attachActive={attachActive} value="Hi" {...handlers} />,
  ).then(() => handlers);
};

describe("ChatComposer", () => {
  it("matches the snapshot", async () => {
    await renderComposer();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("calls onPressAttach and onPressSend from the buttons", async () => {
    const handlers = await renderComposer(true);
    await fireEvent.press(
      screen.getByLabelText(Strings.MessagesScreen.attachDocumentLabel),
    );
    await fireEvent.press(screen.getByLabelText(Strings.MessagesScreen.sendMessage));
    expect(handlers.onPressAttach).toHaveBeenCalledTimes(1);
    expect(handlers.onPressSend).toHaveBeenCalledTimes(1);
  });

  it("forwards text changes and sends on submit", async () => {
    const handlers = await renderComposer();
    const input = screen.getByLabelText(Strings.MessagesScreen.typeMessage);
    await fireEvent.changeText(input, "Hello");
    await fireEvent(input, "submitEditing");
    expect(handlers.onChangeText).toHaveBeenCalledWith("Hello");
    expect(handlers.onPressSend).toHaveBeenCalledTimes(1);
  });
});
