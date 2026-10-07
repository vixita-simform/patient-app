import { darkColors, lightColors, type Colors } from './Colors';

export * from './Metrics';

export { default as Fonts } from './Fonts';
export type { FontFamily, FontSize, FontSizeKey, FontWeight, FontWeightKey } from './Fonts';
const createTheme = (colors: Colors) => ({
  colors
});

export type Theme = ReturnType<typeof createTheme>;
export type ThemeMode = 'light' | 'dark';

export const themes: Record<ThemeMode, Theme> = {
  light: createTheme(lightColors),
  dark: createTheme(darkColors)
};

export const theme = themes.light;

export * from './Colors';
