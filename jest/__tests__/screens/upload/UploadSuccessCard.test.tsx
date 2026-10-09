import { fireEvent, screen } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { UploadSuccessCard } from "../../../../src/screens/upload/components";
import { RenderWrapper } from "../../../Wrapper";

const strings = Strings.UploadScreen;
const recipientLabels = "ifac Office, My Bookkeeper";

describe("UploadSuccessCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<UploadSuccessCard recipientLabels={recipientLabels} onReset={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows the recipients and calls onReset", async () => {
    const onReset = jest.fn();
    await RenderWrapper(<UploadSuccessCard recipientLabels={recipientLabels} onReset={onReset} />);
    expect(screen.getByText(strings.documentUploaded)).toBeOnTheScreen();
    expect(screen.getByText(`${strings.sentTo}${recipientLabels}`)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: strings.uploadAnother }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
