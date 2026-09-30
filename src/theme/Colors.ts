const palette = {
  navy: "#14213D",
  green: "#2F7D6D",
  greenSoft: "#DCEBE6",
  background: "#EEF4F1",
  card: "#FFFFFF",
  muted: "#6B7A8C",
  line: "#DDE5E1",
  coral: "#E4572E",
  coralSoft: "#FBE3DB",
  amber: "#E89B2F",
  amberSoft: "#FBEFD9",
  blue: "#3A6EA5",
  blueSoft: "#DFE9F4",
  tabInactive: "#9AA7B4",
  white: "#FFFFFF",
  slate: "#AFC0D4",
  mint: "#6FD3B8",
  amberInk: "#A5660E",
  whiteAlpha18: "rgba(255,255,255,0.18)",
  whiteAlpha14: "rgba(255,255,255,0.14)",
  whiteAlpha15: "rgba(255,255,255,0.15)",
  paleMint: "#CDE6DF",
  bodySlate: "#44525F",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof palette;
export type Colors = Record<ColorKey, string>;

export const lightColors: Colors = { ...palette };

// Same as light for now; adjust values here when dark mode is designed.
export const darkColors: Colors = { ...palette };

// Palette per theme mode, for style files: Colors[theme].white
// eslint-disable-next-line @typescript-eslint/no-redeclare -- value and type share the name on purpose
export const Colors: Record<"light" | "dark", Colors> = {
  light: lightColors,
  dark: darkColors,
};
export enum ThemeModeEnum {
  light = "light",
  dark = "dark",
  system = "system",
}
