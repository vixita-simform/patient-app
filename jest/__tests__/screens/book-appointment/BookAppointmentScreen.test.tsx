import { screen, userEvent } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";

import { Strings } from "../../../../src/constants";
import { BookAppointmentScreen } from "../../../../src/screens";
import { RenderWrapper } from "../../../Wrapper";

// Thu 1 Oct 2026, 11:10 local, so 11:30 is the first bookable slot.
const NOW = new Date(2026, 9, 1, 11, 10);
const { confirmBooking, selectATimeSlot } = Strings.BookAppointmentScreen;

describe("BookAppointmentScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("enables confirm only while a slot is selected", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "doc_204" });
    const user = userEvent.setup();
    await RenderWrapper(<BookAppointmentScreen />);
    expect(screen.getByText("Dr. Rohan Mehta")).toBeOnTheScreen();
    expect(screen.getByText("October 2026")).toBeOnTheScreen();
    expect(screen.getByText(selectATimeSlot)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: confirmBooking })).toBeDisabled();

    await user.press(screen.getByRole("button", { name: "11:30" }));
    expect(screen.getByRole("button", { name: "11:30" })).toBeSelected();
    expect(screen.getByRole("button", { name: confirmBooking })).toBeEnabled();

    await user.press(screen.getByRole("button", { name: "11:30" }));
    expect(screen.getByRole("button", { name: "11:30" })).not.toBeSelected();
    expect(screen.getByRole("button", { name: confirmBooking })).toBeDisabled();
  });

  it("shows the not-found text for an unknown id", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "doc_missing" });
    await RenderWrapper(<BookAppointmentScreen />);
    expect(screen.getByText(Strings.DoctorProfileScreen.notFound)).toBeOnTheScreen();
  });
});
