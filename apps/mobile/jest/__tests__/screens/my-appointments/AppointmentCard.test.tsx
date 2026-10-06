import { screen, userEvent } from "@testing-library/react-native";

import {
  APPOINTMENT_ACTION_ICON,
  AVATAR_TONE,
  BUTTON_VARIANT,
  STATUS_BADGE_TONE,
  Strings,
} from "../../../../src/constants";
import { AppointmentCard } from "../../../../src/screens/my-appointments/components";
import type { AppointmentCardProps } from "../../../../src/screens/my-appointments/components";
import { RenderWrapper } from "../../../Wrapper";

const baseProps: AppointmentCardProps = {
  initials: "SK",
  avatarTone: AVATAR_TONE.blue,
  doctorName: "Dr. Sneha Kapoor",
  specialtyLabel: "Pediatrics",
  visitModeLabel: Strings.Common.videoCall,
  badgeLabel: Strings.MyAppointmentsScreen.pending,
  badgeTone: STATUS_BADGE_TONE.amber,
  date: "Fri, 2 Oct",
  time: "4:15 PM",
  onPress: jest.fn(),
};

const actions: AppointmentCardProps["actions"] = [
  { label: Strings.Common.cancel, variant: BUTTON_VARIANT.line, onPress: jest.fn() },
  {
    label: Strings.MyAppointmentsScreen.joinCall,
    variant: BUTTON_VARIANT.fill,
    icon: APPOINTMENT_ACTION_ICON.video,
    disabled: true,
    onPress: jest.fn(),
  },
];

describe("AppointmentCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<AppointmentCard {...baseProps} actions={actions} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the doctor, detail line, badge and meta", async () => {
    await RenderWrapper(<AppointmentCard {...baseProps} />);
    [baseProps.doctorName, baseProps.badgeLabel, baseProps.date, baseProps.time,
      `${baseProps.specialtyLabel}${Strings.Common.dotSeparator}${baseProps.visitModeLabel}`].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
  });

  it("renders the action row with each action's disabled state", async () => {
    await RenderWrapper(<AppointmentCard {...baseProps} actions={actions} />);
    expect(screen.getByRole("button", { name: Strings.Common.cancel })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: Strings.MyAppointmentsScreen.joinCall }),
    ).toBeDisabled();
  });

  it("omits the action row when there are no actions", async () => {
    await RenderWrapper(<AppointmentCard {...baseProps} />);
    expect(screen.queryByRole("button", { name: Strings.Common.cancel })).not.toBeOnTheScreen();
  });

  it("calls onPress when the card is pressed", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<AppointmentCard {...baseProps} onPress={onPress} />);
    await user.press(screen.getByText(baseProps.doctorName));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
