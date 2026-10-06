import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from "@expo-google-fonts/figtree";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ROOT_ROUTES } from "../constants";
import { loadAuthToken, useAuth } from "../hooks";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
  const { isLoading, isSignedIn } = useAuth();
  // A font error still counts as ready, so the app falls back to system fonts instead of hanging.
  const isReady = (fontsLoaded || fontError !== null) && !isLoading;

  useEffect(() => {
    loadAuthToken();
  }, []);

  useEffect(() => {
    // Keep the splash up until fonts and the token are both resolved so no wrong route flashes.
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="dark" />
        {/* Guards pick the screen: a deep link to a guarded route redirects to the first allowed one. */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name={ROOT_ROUTES.protected} />
          </Stack.Protected>
          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name={ROOT_ROUTES.signIn} />
          </Stack.Protected>
        </Stack>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
