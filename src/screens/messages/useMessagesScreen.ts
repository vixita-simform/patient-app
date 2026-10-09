import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, type ScrollView } from "react-native";

import {
  CURRENT_USER_NAME,
  MESSAGES,
  SAMPLE_ATTACHMENT,
  Strings,
} from "../../constants";
import type { ThreadMessage } from "../../types";
import { isGroupThread } from "../../utils";
import type { AttachSource, AttachStep } from "./components";
import type { UseMessagesScreenReturn } from "./MessagesScreenTypes";

const DEFAULT_RECIPIENTS = ["office"];

/**
 * Messages screen state: thread selection, composer, attach sheet and local mock messages.
 * @returns {UseMessagesScreenReturn} data and handlers for the screen.
 */
export default function useMessagesScreen(): UseMessagesScreenReturn {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachStep, setAttachStep] = useState<AttachStep>("source");
  const [attachRecipients, setAttachRecipients] =
    useState<string[]>(DEFAULT_RECIPIENTS);
  const [extra, setExtra] = useState<Record<number, ThreadMessage[]>>({});
  const listRef = useRef<ScrollView | null>(null);
  // Counter for ids of locally appended messages; keeps React keys unique per screen.
  const localIdRef = useRef(0);

  const selectedThread = useMemo(
    () => MESSAGES.find((m) => m.id === selectedId),
    [selectedId],
  );
  const isGroup = selectedThread ? isGroupThread(selectedThread) : false;
  const threadMessages = useMemo(
    () =>
      selectedThread
        ? [...selectedThread.thread, ...(extra[selectedThread.id] ?? [])]
        : [],
    [selectedThread, extra],
  );

  const resetAttach = useCallback(() => {
    setAttachOpen(false);
    setAttachStep("source");
    setAttachRecipients(DEFAULT_RECIPIENTS);
  }, []);

  const onSelectThread = useCallback((id: number) => setSelectedId(id), []);
  const onCloseThread = useCallback(() => {
    setSelectedId(null);
    resetAttach();
  }, [resetAttach]);

  useFocusEffect(
    useCallback(
      () => () => {
        setSelectedId(null);
        resetAttach();
      },
      [resetAttach],
    ),
  );

  useEffect(() => {
    if (selectedId === null) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onCloseThread();
      return true;
    });
    return () => sub.remove();
  }, [selectedId, onCloseThread]);

  const appendMessage = useCallback(
    (entry: Omit<ThreadMessage, "id">) => {
      if (selectedId === null) return;
      localIdRef.current += 1;
      const next: ThreadMessage = { ...entry, id: `local-${localIdRef.current}` };
      setExtra((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), next],
      }));
    },
    [selectedId],
  );

  const onToggleAttach = useCallback(() => setAttachOpen((open) => !open), []);
  const onCloseAttach = useCallback(() => {
    setAttachOpen(false);
    setAttachStep("source");
  }, []);
  // Both sources lead to the recipients step; the source is unused until real capture/upload exists.
  const onPickSource = useCallback(
    (_source: AttachSource) => setAttachStep("recipients"),
    [],
  );
  const onBackToSource = useCallback(() => setAttachStep("source"), []);

  const onSendAttachment = useCallback(() => {
    // Note: sending is local-only until the messaging API exists; the sample attachment is appended in memory.
    appendMessage({
      sender: CURRENT_USER_NAME,
      staff: false,
      attachment: SAMPLE_ATTACHMENT,
      recipients: [...attachRecipients],
      time: Strings.Common.now,
    });
    onCloseAttach();
  }, [appendMessage, attachRecipients, onCloseAttach]);

  const onPressSend = useCallback(() => {
    const text = message.trim();
    if (!text) return;
    // Note: sending is local-only until the messaging API exists; the message is appended in memory.
    appendMessage({
      sender: CURRENT_USER_NAME,
      staff: false,
      text,
      time: Strings.Common.now,
    });
    setMessage("");
  }, [appendMessage, message]);

  const onContentSizeChange = useCallback(
    () => listRef.current?.scrollToEnd({ animated: true }),
    [],
  );

  return {
    threads: MESSAGES,
    selectedThread,
    isGroup,
    threadMessages,
    message,
    attachOpen,
    attachStep,
    attachRecipients,
    listRef,
    onSelectThread,
    onCloseThread,
    onChangeMessage: setMessage,
    onToggleAttach,
    onCloseAttach,
    onPickSource,
    onBackToSource,
    onChangeRecipients: setAttachRecipients,
    onSendAttachment,
    onPressSend,
    onContentSizeChange,
  };
}
