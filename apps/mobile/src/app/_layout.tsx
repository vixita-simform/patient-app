import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ROOT_ROUTES } from '../constants';
import { PatientProvider, usePatient } from '../context';
import { loadAuthToken, useAuth } from '../hooks';

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash was already hidden or is unavailable; nothing to hold.
});

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold
  });
  const { isLoading, isSignedIn } = useAuth();
  const { isLoading: isPatientLoading, patient } = usePatient();
  // A font error still counts as ready, so the app falls back to system fonts instead of hanging.
  // A token without a restorable patient cannot render the protected screens; sign in again.
  const hasSession = isSignedIn && patient !== null;
  const isReady = (fontsLoaded || fontError !== null) && !isLoading && !isPatientLoading;

  useEffect(() => {
    loadAuthToken();
  }, []);

  useEffect(() => {
    // Keep the splash up until fonts, the token and the stored patient are all resolved so no wrong route flashes.
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
          <Stack.Protected guard={hasSession}>
            <Stack.Screen name={ROOT_ROUTES.protected} />
          </Stack.Protected>
          <Stack.Protected guard={!hasSession}>
            <Stack.Screen name={ROOT_ROUTES.signIn} />
          </Stack.Protected>
        </Stack>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <PatientProvider>
      <RootNavigator />
    </PatientProvider>
  );
}
