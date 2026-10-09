import { router, usePathname } from "expo-router";
import { useCallback, useMemo } from "react";

import { MORE_ITEMS, STACK_ROUTES } from "../../constants";
import type { MoreItem } from "../../types";

interface UseFeatureScreenReturn {
  item: MoreItem | undefined;
  onBack: () => void;
}

/**
 * Resolves which More item the current stack route belongs to.
 * @returns {UseFeatureScreenReturn} the matching item and a back handler.
 */
export default function useFeatureScreen(): UseFeatureScreenReturn {
  const pathname = usePathname();
  const item = useMemo(
    () => MORE_ITEMS.find((entry) => STACK_ROUTES[entry.id] === pathname),
    [pathname],
  );
  const onBack = useCallback(() => router.back(), []);

  return { item, onBack };
}
