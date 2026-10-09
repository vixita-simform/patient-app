import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler } from "react-native";

import {
  RECIPIENTS,
  Strings,
  UPLOADED_DOCS,
  VERIFICATION_DOCUMENT_TYPES,
} from "../../constants";
import type { UseUploadScreenReturn } from "./UploadScreenTypes";

export const PAGE_SIZE = 3;
export const UPLOAD_DELAY_MS = 1400;
export const DEFAULT_RECIPIENTS = ["office"];

/**
 * Upload screen state: type picker, recipients, mock upload and paged history.
 * The source tiles open the type picker: real camera / file capture needs
 * expo-image-picker / expo-document-picker and a new dev build.
 * @returns {UseUploadScreenReturn} data and handlers for the screen.
 */
export default function useUploadScreen(): UseUploadScreenReturn {
  const [picking, setPicking] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [recips, setRecips] = useState<string[]>(DEFAULT_RECIPIENTS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!picking) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setPicking(false);
      return true;
    });
    return () => sub.remove();
  }, [picking]);

  const onOpenPicker = useCallback(() => setPicking(true), []);
  const onClosePicker = useCallback(() => setPicking(false), []);
  const onSelectType = useCallback((type: string) => {
    setSelectedType(type);
    setPicking(false);
  }, []);

  const onSubmit = useCallback(() => {
    setUploading(true);
    // Upload is simulated with a timer until the upload API exists.
    timer.current = setTimeout(() => {
      setUploading(false);
      setDone(true);
    }, UPLOAD_DELAY_MS);
  }, []);

  const onReset = useCallback(() => {
    setDone(false);
    setSelectedType(null);
    setRecips(DEFAULT_RECIPIENTS);
  }, []);

  const onLoadMore = useCallback(
    () => setVisibleCount((count) => count + PAGE_SIZE),
    [],
  );

  const recipientLabels = useMemo(
    () =>
      RECIPIENTS.filter((recipient) => recips.includes(recipient.id))
        .map((recipient) => recipient.label)
        .join(Strings.Common.listSeparator),
    [recips],
  );

  return {
    picking,
    selectedType,
    uploading,
    done,
    recips,
    isVerification:
      selectedType !== null && VERIFICATION_DOCUMENT_TYPES.includes(selectedType),
    canSubmit: selectedType !== null && recips.length > 0,
    visibleDocs: UPLOADED_DOCS.slice(0, visibleCount),
    remainingCount: Math.max(0, UPLOADED_DOCS.length - visibleCount),
    recipientLabels,
    setRecips,
    onOpenPicker,
    onClosePicker,
    onSelectType,
    onSubmit,
    onReset,
    onLoadMore,
  };
}
