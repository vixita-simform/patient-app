import { act, render, screen, userEvent } from "@testing-library/react-native";

import { CalendarModal } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

// The native picker has no JS implementation under Jest; expose its props for assertions.
jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: (props: object) => <View testID="date-picker" {...props} />,
  };
});

const SELECTED = new Date(2026, 8, 29);
const PICKED = new Date(2026, 9, 3);

const renderModal = async () => {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();
  await RenderWrapper(
    <CalendarModal
      visible
      selectedDate={SELECTED}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />,
  );
  return { onConfirm, onDismiss };
};

describe("CalendarModal", () => {
  it("renders the picker on the selected date", async () => {
    await renderModal();
    expect(screen.getByText(Strings.Common.cancel)).toBeOnTheScreen();
    expect(screen.getByText(Strings.Common.done)).toBeOnTheScreen();
    expect(screen.getByTestId("date-picker").props.value).toBe(SELECTED);
  });

  it("calls onDismiss from Cancel", async () => {
    const user = userEvent.setup();
    const { onDismiss, onConfirm } = await renderModal();
    await user.press(screen.getByText(Strings.Common.cancel));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onDismiss from the backdrop", async () => {
    const user = userEvent.setup();
    const { onDismiss } = await renderModal();
    // The backdrop is the first Cancel-labelled button; the header Cancel is the second.
    const [backdrop] = screen.getAllByRole("button", { name: Strings.Common.cancel });
    await user.press(backdrop);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm with the selected date when nothing was picked", async () => {
    const user = userEvent.setup();
    const { onConfirm } = await renderModal();
    await user.press(screen.getByRole("button", { name: Strings.Common.done }));
    expect(onConfirm).toHaveBeenCalledWith(SELECTED);
  });

  it("calls onConfirm with the picked date", async () => {
    const user = userEvent.setup();
    const { onConfirm, onDismiss } = await renderModal();
    await act(async () => {
      screen.getByTestId("date-picker").props.onChange({ type: "set" }, PICKED);
    });
    await user.press(screen.getByRole("button", { name: Strings.Common.done }));
    expect(onConfirm).toHaveBeenCalledWith(PICKED);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("discards an unconfirmed pick when reopened", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const props = { selectedDate: SELECTED, onConfirm, onDismiss: jest.fn() };
    const { rerender } = await render(<CalendarModal visible {...props} />);
    await act(async () => {
      screen.getByTestId("date-picker").props.onChange({ type: "set" }, PICKED);
    });
    await rerender(<CalendarModal visible={false} {...props} />);
    await rerender(<CalendarModal visible {...props} />);
    expect(screen.getByTestId("date-picker").props.value).toBe(SELECTED);
    await user.press(screen.getByRole("button", { name: Strings.Common.done }));
    expect(onConfirm).toHaveBeenCalledWith(SELECTED);
  });
});
