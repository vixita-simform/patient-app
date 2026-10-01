import { screen, userEvent } from "@testing-library/react-native";

import { NOTIFICATION_TYPE, Strings } from "../../../../src/constants";
import { NotificationRow } from "../../../../src/screens/notifications/components";
import type { NotificationRowData } from "../../../../src/screens/notifications/components";
import { RenderWrapper } from "../../../Wrapper";

const NOTIFICATION: NotificationRowData = {
  id: "notif_lab",
  type: NOTIFICATION_TYPE.labReport,
  title: "Lab report ready",
  subtitle: "Your complete blood count results are available.",
  createdAt: "2026-10-01T10:00:00.000Z",
  unread: true,
  timeLabel: "1 hr ago",
};

describe("NotificationRow", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<NotificationRow notification={NOTIFICATION} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders title, subtitle and time label", async () => {
    await RenderWrapper(<NotificationRow notification={NOTIFICATION} />);
    [NOTIFICATION.title, NOTIFICATION.subtitle, NOTIFICATION.timeLabel].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
  });

  it("announces the unread state in its label", async () => {
    await RenderWrapper(<NotificationRow notification={NOTIFICATION} />);
    expect(
      screen.getByRole("button", {
        name: `${NOTIFICATION.title}, ${Strings.NotificationsScreen.unread}`,
      }),
    ).toBeOnTheScreen();
  });

  it("labels a read row with its title only", async () => {
    await RenderWrapper(<NotificationRow notification={{ ...NOTIFICATION, unread: false }} />);
    expect(screen.getByRole("button", { name: NOTIFICATION.title })).toBeOnTheScreen();
  });

  it("calls onPress with the notification id", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<NotificationRow notification={NOTIFICATION} onPress={onPress} />);
    await user.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledWith(NOTIFICATION.id);
  });
});
