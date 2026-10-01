import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  APPOINTMENT_ACTION_ICON,
  APPOINTMENT_TAB,
  appointmentsDummyData,
  STACK_ROUTES,
  STATUS_BADGE_TONE,
  Strings,
} from "../../../src/constants";
import useMyAppointmentsScreen from "../../../src/screens/my-appointments/useMyAppointmentsScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

describe("useMyAppointmentsScreen", () => {
  it("starts on Upcoming and lists its appointments", async () => {
    const { result } = await RenderWrapperForHooks(() => useMyAppointmentsScreen());
    expect(result.current.activeTab).toBe(APPOINTMENT_TAB.upcoming);
    expect(result.current.tabs.map(({ id }) => id)).toEqual([
      APPOINTMENT_TAB.upcoming,
      APPOINTMENT_TAB.completed,
      APPOINTMENT_TAB.cancelled,
    ]);
    expect(result.current.listData.map(({ id }) => id)).toEqual(
      appointmentsDummyData.upcoming.map(({ id }) => id),
    );
  });

  it.each([APPOINTMENT_TAB.completed, APPOINTMENT_TAB.cancelled])(
    "filters the list when switching to %s",
    async (tab) => {
      const { result } = await RenderWrapperForHooks(() => useMyAppointmentsScreen());
      await act(async () => result.current.onTabPress(tab));
      expect(result.current.activeTab).toBe(tab);
      expect(result.current.listData.map(({ id }) => id)).toEqual(
        appointmentsDummyData[tab].map(({ id }) => id),
      );
      // Completed/cancelled cards carry no action row.
      result.current.listData.forEach((item) => expect(item.actions).toBeUndefined());
    },
  );

  it("maps status badges and per-visit-mode actions", async () => {
    const { result } = await RenderWrapperForHooks(() => useMyAppointmentsScreen());
    const [inPerson, video] = result.current.listData;

    expect(inPerson.badgeLabel).toBe(Strings.MyAppointmentsScreen.confirmed);
    expect(inPerson.badgeTone).toBe(STATUS_BADGE_TONE.green);
    expect(inPerson.visitModeLabel).toBe(Strings.Common.inPerson);
    expect(inPerson.actions?.map(({ label }) => label)).toEqual([
      Strings.MyAppointmentsScreen.reschedule,
      Strings.MyAppointmentsScreen.getDirections,
    ]);

    expect(video.badgeLabel).toBe(Strings.MyAppointmentsScreen.pending);
    expect(video.badgeTone).toBe(STATUS_BADGE_TONE.amber);
    expect(video.visitModeLabel).toBe(Strings.Common.videoCall);
    expect(video.actions?.map(({ label }) => label)).toEqual([
      Strings.Common.cancel,
      Strings.MyAppointmentsScreen.joinCall,
    ]);
    expect(video.actions?.[1].icon).toBe(APPOINTMENT_ACTION_ICON.video);
    // Every action flow is unbuilt, so the buttons render disabled.
    [...(inPerson.actions ?? []), ...(video.actions ?? [])].forEach((action) =>
      expect(action.disabled).toBe(true),
    );
  });

  it("opens the doctor profile when a card is pressed", async () => {
    const { result } = await RenderWrapperForHooks(() => useMyAppointmentsScreen());
    result.current.listData[0].onPress();
    expect(router.push).toHaveBeenCalledWith({
      pathname: STACK_ROUTES.doctorProfile,
      params: { id: appointmentsDummyData.upcoming[0].doctorId },
    });
  });

  it("opens Find a doctor from the add button", async () => {
    const { result } = await RenderWrapperForHooks(() => useMyAppointmentsScreen());
    result.current.onPressAdd();
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
  });
});
