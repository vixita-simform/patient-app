import type { BottomTabNavigationOptions } from "expo-router/js-tabs";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../hooks";
import { Colors } from "../theme";
import TabBarStyles, { TAB_BAR_BASE_HEIGHT } from "./TabBarStyles";

/**
 * Screen options for the bottom tab navigator, themed and sized to the bottom safe-area inset.
 * @returns {BottomTabNavigationOptions} options for `<Tabs screenOptions>`
 */
export default function useTabScreenOptions(): BottomTabNavigationOptions {
  const { theme, styles } = useTheme(TabBarStyles);
  const { bottom } = useSafeAreaInsets();

  return useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: Colors[theme].green,
      tabBarInactiveTintColor: Colors[theme].tabInactive,
      tabBarStyle: StyleSheet.flatten([
        styles.tabBar,
        { height: TAB_BAR_BASE_HEIGHT + bottom },
      ]),
      tabBarLabelStyle: styles.tabBarLabel,
    }),
    [theme, styles, bottom],
  );
}
