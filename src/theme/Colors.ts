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
  navyAlpha40: "rgba(20,33,61,0.4)",
  // Segmented-tabs track background; distinct from `line` (#DDE5E1).
  segmentTrack: "#DDE7E3",
  // Records: coral-tone badge text ("1 flag"), pairs with `coralSoft` background.
  coralInk: "#B63A17",
  // Records: summary-tile background on the green summary card.
  whiteAlpha12: "rgba(255,255,255,0.12)",
  // Lab report detail: alert-card text, no matching token.
  alertInk: "#8E2E13",
  // Lab report detail: alert-card border, no matching token.
  alertBorder: "#F5C8B8",
  // Lab report detail: range-bar track background, no matching token.
  rangeTrack: "#E6ECE9",
  // Lab report detail: range-bar "normal" band background, no matching token.
  rangeNormalBand: "#BFE0D6",
  // Profile: grey count-badge background ("4" on Family members).
  greyBadge: "#E8ECEF",
  // Sign in: info-card body text on `blueSoft`.
  infoInk: "#2C4F76",
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
