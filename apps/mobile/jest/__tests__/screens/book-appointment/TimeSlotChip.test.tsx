import { screen, userEvent } from "@testing-library/react-native";

import { TIME_SLOT_STATUS, type TimeSlotStatus } from "../../../../src/constants";
import { TimeSlotChip } from "../../../../src/screens/book-appointment/components";
import { RenderWrapper } from "../../../Wrapper";

const renderChip = (status: TimeSlotStatus, onPress = jest.fn()) =>
  RenderWrapper(<TimeSlotChip id="13:30" label="1:30" status={status} onPress={onPress} />);

describe("TimeSlotChip", () => {
  it.each(Object.values(TIME_SLOT_STATUS))("matches the snapshot when %s", async (status) => {
    await renderChip(status);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("marks a selected slot selected", async () => {
    await renderChip(TIME_SLOT_STATUS.selected);
    expect(screen.getByRole("button", { name: "1:30" })).toBeSelected();
  });

  it("passes its id to onPress when available", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderChip(TIME_SLOT_STATUS.available, onPress);
    await user.press(screen.getByRole("button", { name: "1:30" }));
    expect(onPress).toHaveBeenCalledWith("13:30");
  });

  it.each([TIME_SLOT_STATUS.taken, TIME_SLOT_STATUS.past])(
    "is disabled and ignores presses when %s",
    async (status) => {
      const user = userEvent.setup();
      const onPress = jest.fn();
      await renderChip(status, onPress);
      const button = screen.getByRole("button", { name: "1:30" });
      expect(button).toBeDisabled();
      await user.press(button);
      expect(onPress).not.toHaveBeenCalled();
    },
  );
});
