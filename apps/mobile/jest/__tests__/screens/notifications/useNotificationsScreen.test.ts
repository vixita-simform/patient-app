import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import { getNotificationsDummyData } from "../../../../src/constants";
import useNotificationsScreen from "../../../../src/screens/notifications/useNotificationsScreen";
import { RenderWrapperForHooks } from "../../../Wrapper";

const renderScreenHook = () => RenderWrapperForHooks(() => useNotificationsScreen());

const unreadIds = (groups: ReturnType<typeof useNotificationsScreen>["groups"]): string[] =>
  groups.flatMap((group) => group.notifications).filter((n) => n.unread).map((n) => n.id);

describe("useNotificationsScreen", () => {
  it("groups every dummy notification with a time label", async () => {
    const { result } = await renderScreenHook();
    const rows = result.current.groups.flatMap((group) => group.notifications);
    expect(rows).toHaveLength(getNotificationsDummyData().length);
    rows.forEach((row) => expect(row.timeLabel).not.toBe(""));
    expect(result.current.hasUnread).toBe(true);
    expect(result.current.markAllReadAccessibilityState).toEqual({ disabled: false });
  });

  it("marks one notification read", async () => {
    const { result } = await renderScreenHook();
    const [first, ...rest] = unreadIds(result.current.groups);
    await act(() => result.current.onPressNotification(first));
    expect(unreadIds(result.current.groups)).toEqual(rest);
  });

  it("marks all notifications read and disables the action", async () => {
    const { result } = await renderScreenHook();
    await act(() => result.current.onPressMarkAllRead());
    expect(unreadIds(result.current.groups)).toEqual([]);
    expect(result.current.hasUnread).toBe(false);
    expect(result.current.markAllReadAccessibilityState).toEqual({ disabled: true });
  });

  it("goes back", async () => {
    const { result } = await renderScreenHook();
    result.current.onPressBack();
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
