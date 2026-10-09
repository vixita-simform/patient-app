import { router } from "expo-router";
import { useCallback } from "react";

import { MORE_ITEMS, STACK_ROUTES } from "../../constants";
import type { MoreItemId } from "../../types";
import type { UseMoreScreenReturn } from "./MoreScreenTypes";

/**
 * More screen data and navigation handlers.
 * @returns {UseMoreScreenReturn} data and handlers for the screen.
 */
export default function useMoreScreen(): UseMoreScreenReturn {
  const onPressItem = useCallback((id: MoreItemId) => router.push(STACK_ROUTES[id]), []);

  return { items: MORE_ITEMS, onPressItem };
}
