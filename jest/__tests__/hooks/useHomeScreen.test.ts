import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  CLIENT_CODES,
  DOCUMENTS,
  HOME_SUMMARY,
  NOTIFICATIONS,
  STACK_ROUTES,
  TAB_ROUTES,
  TEAM,
} from "../../../src/constants";
import useHomeScreen from "../../../src/screens/home/useHomeScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

describe("useHomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts on the first client with the sheet closed", async () => {
    const { result } = await RenderWrapperForHooks(useHomeScreen);
    expect(result.current.client).toBe(CLIENT_CODES[0]);
    expect(result.current.ccOpen).toBe(false);
    expect(result.current.clientCodes).toBe(CLIENT_CODES);
    expect(result.current.showClientSwitch).toBe(CLIENT_CODES.length > 1);
  });

  it("opens and closes the client sheet", async () => {
    const { result } = await RenderWrapperForHooks(useHomeScreen);
    await act(async () => result.current.onOpenClientSheet());
    expect(result.current.ccOpen).toBe(true);
    await act(async () => result.current.onCloseClientSheet());
    expect(result.current.ccOpen).toBe(false);
  });

  it("switches client and closes the sheet on select", async () => {
    const { result } = await RenderWrapperForHooks(useHomeScreen);
    await act(async () => result.current.onOpenClientSheet());
    await act(async () => result.current.onSelectClient(CLIENT_CODES[1]));
    expect(result.current.client).toBe(CLIENT_CODES[1]);
    expect(result.current.ccOpen).toBe(false);
  });

  it("derives the dashboard slices", async () => {
    const { result } = await RenderWrapperForHooks(useHomeScreen);
    expect(result.current.recentDocuments).toHaveLength(3);
    expect(result.current.recentDocuments[0]).toBe(DOCUMENTS[0]);
    expect(result.current.recentMessages).toHaveLength(2);
    expect(result.current.unreadCount).toBe(NOTIFICATIONS.filter((n) => !n.read).length);
    expect(result.current.documentCount).toBe(DOCUMENTS.length);
    expect(result.current.summary).toBe(HOME_SUMMARY);
    expect(result.current.team).toBe(TEAM);
  });

  it.each([
    ["onPressNotifications", STACK_ROUTES.notifications],
    ["onPressOutstanding", STACK_ROUTES.checklist],
    ["onPressDocuments", `/${TAB_ROUTES.documents}`],
    ["onPressSigning", STACK_ROUTES.signing],
    ["onPressMessages", `/${TAB_ROUTES.messages}`],
    ["onPressTeam", STACK_ROUTES.team],
  ] as const)("%s pushes %s", async (handler, path) => {
    const { result } = await RenderWrapperForHooks(useHomeScreen);
    await act(async () => result.current[handler]());
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(path);
  });
});
