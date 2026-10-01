import { Stack } from "expo-router";

/**
 * Stack for every signed-in screen; the root layout guards the whole group.
 */
export default function ProtectedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
