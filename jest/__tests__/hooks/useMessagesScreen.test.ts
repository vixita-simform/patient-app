import { act } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";
import type { EffectCallback } from "react";

import { CURRENT_USER_NAME, MESSAGES, SAMPLE_ATTACHMENT, Strings } from "../../../src/constants";
import useMessagesScreen from "../../../src/screens/messages/useMessagesScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

const [direct, group] = MESSAGES;
const setup = () => RenderWrapperForHooks(() => useMessagesScreen());

describe("useMessagesScreen", () => {
  it("starts on the thread list", async () => {
    const { result } = await setup();
    expect(result.current.threads).toBe(MESSAGES);
    expect(result.current.selectedThread).toBeUndefined();
    expect(result.current.threadMessages).toEqual([]);
    expect(result.current.isGroup).toBe(false);
  });

  it("selects and closes a thread", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    expect(result.current.selectedThread).toBe(direct);
    expect(result.current.threadMessages).toEqual(direct.thread);
    await act(() => result.current.onCloseThread());
    expect(result.current.selectedThread).toBeUndefined();
  });

  it("flags group threads", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(group.id));
    expect(result.current.isGroup).toBe(true);
  });

  it("onPressSend trims the input, appends it and clears the composer", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    await act(() => result.current.onChangeMessage("  Hello  "));
    await act(() => result.current.onPressSend());
    const last = result.current.threadMessages.at(-1);
    expect(last).toMatchObject({
      sender: CURRENT_USER_NAME,
      staff: false,
      text: "Hello",
      time: Strings.Common.now,
    });
    expect(last?.id).toMatch(/^local-/);
    expect(result.current.message).toBe("");
  });

  it("onPressSend ignores blank input", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    await act(() => result.current.onChangeMessage("   "));
    await act(() => result.current.onPressSend());
    expect(result.current.threadMessages).toHaveLength(direct.thread.length);
  });

  it("gives each local message a unique id", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    for (const text of ["one", "two"]) {
      await act(() => result.current.onChangeMessage(text));
      await act(() => result.current.onPressSend());
    }
    const ids = result.current.threadMessages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("walks the attach sheet and appends an attachment with recipients", async () => {
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    await act(() => result.current.onToggleAttach());
    expect(result.current.attachOpen).toBe(true);
    expect(result.current.attachStep).toBe("source");
    await act(() => result.current.onPickSource("storage"));
    expect(result.current.attachStep).toBe("recipients");
    await act(() => result.current.onChangeRecipients(["office", "bookkeeper"]));
    await act(() => result.current.onSendAttachment());
    expect(result.current.threadMessages.at(-1)).toMatchObject({
      attachment: SAMPLE_ATTACHMENT,
      recipients: ["office", "bookkeeper"],
      time: Strings.Common.now,
    });
    expect(result.current.attachOpen).toBe(false);
    expect(result.current.attachStep).toBe("source");
  });

  it("onBackToSource returns to the source step", async () => {
    const { result } = await setup();
    await act(() => result.current.onPickSource("camera"));
    await act(() => result.current.onBackToSource());
    expect(result.current.attachStep).toBe("source");
  });

  it("resets the selection when the screen loses focus", async () => {
    let focusCallback: EffectCallback | undefined;
    jest.mocked(useFocusEffect).mockImplementation((cb: EffectCallback) => {
      focusCallback = cb;
    });
    const { result } = await setup();
    await act(() => result.current.onSelectThread(direct.id));
    await act(() => result.current.onToggleAttach());
    // Blur: run the focus effect's cleanup.
    await act(() => {
      const cleanup = focusCallback?.();
      if (typeof cleanup === "function") cleanup();
    });
    expect(result.current.selectedThread).toBeUndefined();
    expect(result.current.attachOpen).toBe(false);
  });
});
