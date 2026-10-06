import { type Href, router } from "expo-router";

/**
 * Pops back when there is history, otherwise replaces the screen with `fallback`
 * (e.g. when the screen was opened from a deep link).
 * @param {Href} fallback - where to land when there is nothing to go back to.
 */
export function goBackOr(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
