import { fireEvent, screen } from "@testing-library/react-native";

import { RECIPIENTS, SAMPLE_ATTACHMENT, Strings } from "../../../../src/constants";
import { AttachDocumentSheet } from "../../../../src/screens/messages/components";
import type { AttachStep } from "../../../../src/screens/messages/components";
import { RenderWrapper } from "../../../Wrapper";

const renderSheet = async (step: AttachStep, selected: string[] = ["office"]) => {
  const handlers = {
    onChangeSelected: jest.fn(),
    onPickSource: jest.fn(),
    onBack: jest.fn(),
    onSend: jest.fn(),
    onClose: jest.fn(),
  };
  await RenderWrapper(
    <AttachDocumentSheet
      visible
      attachment={SAMPLE_ATTACHMENT}
      recipients={RECIPIENTS}
      selected={selected}
      step={step}
      {...handlers}
    />,
  );
  return handlers;
};

describe("AttachDocumentSheet", () => {
  it("matches the snapshot", async () => {
    await renderSheet("source");
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("passes the picked source on the source step", async () => {
    const handlers = await renderSheet("source");
    expect(screen.getByText(Strings.MessagesScreen.attachDocument)).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(Strings.Common.takePhoto));
    await fireEvent.press(screen.getByLabelText(Strings.Common.uploadFromStorage));
    expect(handlers.onPickSource).toHaveBeenNthCalledWith(1, "camera");
    expect(handlers.onPickSource).toHaveBeenNthCalledWith(2, "storage");
  });

  it("shows the file and sends to the selected recipients", async () => {
    const handlers = await renderSheet("recipients");
    const sendLabel = `${Strings.MessagesScreen.sendTo} 1 ${Strings.MessagesScreen.recipientSingular}`;
    expect(screen.getByText(Strings.Common.whoShouldSee)).toBeOnTheScreen();
    expect(screen.getByText(SAMPLE_ATTACHMENT.name)).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(sendLabel));
    await fireEvent.press(screen.getByLabelText(Strings.Common.back));
    expect(handlers.onSend).toHaveBeenCalledTimes(1);
    expect(handlers.onBack).toHaveBeenCalledTimes(1);
  });

  it("disables send when no recipient is selected", async () => {
    const handlers = await renderSheet("recipients", []);
    const button = screen.getByLabelText(Strings.MessagesScreen.selectRecipient);
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(handlers.onSend).not.toHaveBeenCalled();
  });
});
