import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import {
  CLIENT_CODES,
  DOCUMENTS,
  HOME_SUMMARY,
  MESSAGES,
  NOTIFICATIONS,
  STACK_ROUTES,
  TAB_ROUTES,
  TEAM,
} from "../../constants";
import type { ClientCode } from "../../types";
import type { UseHomeScreenReturn } from "./HomeScreenTypes";

const DOCUMENTS_PATH = `/${TAB_ROUTES.documents}` as const;
const MESSAGES_PATH = `/${TAB_ROUTES.messages}` as const;
const RECENT_DOCUMENT_COUNT = 3;
const RECENT_MESSAGE_COUNT = 2;

/**
 * Home screen state and navigation handlers.
 * @returns {UseHomeScreenReturn} data and handlers for the screen.
 */
export default function useHomeScreen(): UseHomeScreenReturn {
  const [client, setClient] = useState<ClientCode>(CLIENT_CODES[0]);
  const [ccOpen, setCcOpen] = useState(false);

  const unreadCount = useMemo(() => NOTIFICATIONS.filter((n) => !n.read).length, []);
  const recentDocuments = useMemo(() => DOCUMENTS.slice(0, RECENT_DOCUMENT_COUNT), []);
  const recentMessages = useMemo(() => MESSAGES.slice(0, RECENT_MESSAGE_COUNT), []);

  const onOpenClientSheet = useCallback(() => setCcOpen(true), []);
  const onCloseClientSheet = useCallback(() => setCcOpen(false), []);
  const onSelectClient = useCallback((next: ClientCode) => {
    setClient(next);
    setCcOpen(false);
  }, []);

  const onPressNotifications = useCallback(() => router.push(STACK_ROUTES.notifications), []);
  const onPressOutstanding = useCallback(() => router.push(STACK_ROUTES.checklist), []);
  const onPressDocuments = useCallback(() => router.push(DOCUMENTS_PATH), []);
  const onPressSigning = useCallback(() => router.push(STACK_ROUTES.signing), []);
  const onPressMessages = useCallback(() => router.push(MESSAGES_PATH), []);
  const onPressTeam = useCallback(() => router.push(STACK_ROUTES.team), []);

  return {
    client,
    clientCodes: CLIENT_CODES,
    showClientSwitch: CLIENT_CODES.length > 1,
    ccOpen,
    unreadCount,
    recentDocuments,
    recentMessages,
    documentCount: DOCUMENTS.length,
    summary: HOME_SUMMARY,
    team: TEAM,
    onOpenClientSheet,
    onCloseClientSheet,
    onSelectClient,
    onPressNotifications,
    onPressOutstanding,
    onPressDocuments,
    onPressSigning,
    onPressMessages,
    onPressTeam,
  };
}
