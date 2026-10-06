import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import type { ThemeMode } from "../theme";
import { ThemeModeEnum } from "../theme";

/** A concrete theme mode, or follow the OS setting. */
type ThemeModeSetting = ThemeMode | ThemeModeEnum.system;

interface UseThemeReturn<T> {
  isDark: boolean;
  theme: ThemeMode;
  styles: T;
  changeTheme: (value: ThemeMode) => void;
}

/**
 * A theme hook that returns the current theme and whether it is dark.
 * NOTE: theme state is local to each hook call, so `changeTheme` only re-themes the caller.
 * Move this state into a shared ThemeProvider (context) before enabling runtime theme switching.
 * @param {(theme: ThemeMode) => T} styleSheetFn? - A function that returns a style sheet for the theme.
 * @returns An object with the following properties:
 * - isDark: boolean - flag for whether the theme is dark or not.
 * - theme: ThemeMode - current theme mode.
 * - styles?: T - current theme mode based styles.
 * - changeTheme: (value: ThemeMode) => void - change the current theme mode.
 */
const useTheme = <T>(
  styleSheetFn?: (theme: ThemeMode, isDark?: boolean) => T,
): UseThemeReturn<T> => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeModeSetting>(ThemeModeEnum.light);
  const currentThemeMode = useMemo<ThemeMode>(() => {
    if (themeMode !== ThemeModeEnum.system) {
      return themeMode;
    }
    // Map explicitly so null / 'unspecified' never reach Colors[theme]
    return colorScheme === ThemeModeEnum.dark ? ThemeModeEnum.dark : ThemeModeEnum.light;
  }, [colorScheme, themeMode]);
  const isDark = currentThemeMode === ThemeModeEnum.dark;
  const styles = useMemo<T>(
    () => (styleSheetFn?.(currentThemeMode, isDark) ?? {}) as T,
    [styleSheetFn, currentThemeMode, isDark],
  );
  const changeTheme = useCallback((value: ThemeMode): void => {
    setThemeMode(value);
  }, []);

  return { isDark, theme: currentThemeMode, styles, changeTheme };
};

export default useTheme;
