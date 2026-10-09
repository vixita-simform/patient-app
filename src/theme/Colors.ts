const palette = {
  navy: "#14213D",
  green: "#2F7D6D",
  greenSoft: "#DCEBE6",
  background: "#F4F7F8",
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
  primary: "#009CA6",
  textSecondary: "#545859",
  border: "#E1E6E8",
  text: "#002B49",
  primaryDark: "#007E8A",
  accent: "#00B74F",
  primarySoft: "#EAF7F8",
  danger: "#E53935",
  whiteAlpha75: "rgba(255,255,255,0.75)",
  whiteAlpha65: "rgba(255,255,255,0.65)",
  teal: "#00A0B8",
  tealDark: "#0090A6",
  petrol: "#005670",
  amberTint: "#FFF8E1",
  amberBorder: "#FFD54F",
  orangeSoft: "#FFF3E0",
  orange: "#E65100",
  overlay: "rgba(0,20,30,0.38)",
  black: "#000000",
  primaryTint: "#E0F4F7",
  successSoft: "#E8F5E9",
  successStrong: "#C8E6C9",
  successBorder: "#B7DDBE",
  limeSoft: "#F1F8E9",
  error: "#C62828",
  checkboxBorder: "#C3CDD2",
  blueBorder: "#90CAF9",
  mutedSoft: "#ECEFEA",
  dangerBorder: "#EF9A9A",
  dangerSoft: "#FFEBEE",
  whiteAlpha70: "rgba(255,255,255,0.7)",
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
