import { scale } from "./Metrics";

/**
 * Figtree font families, matching the fonts loaded in src/app/_layout.tsx
 */
const family = {
  regular: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semiBold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
  extraBold: "Figtree_800ExtraBold",
} as const;

/**
 * Font sizes with const assertion for precise literal types
 * Provides excellent IntelliSense and type safety without interface duplication
 */
const size = {
  h6: scale(9),
  h5: scale(11),
  h4: scale(13),
  h3: scale(15),
  h2: scale(17),
  h1: scale(20),
  small: scale(10),
  medium: scale(23.5),
  large: scale(25),
  header: scale(18),
  f12: scale(12),
  f14: scale(14),
  f16: scale(16),
  f22: scale(22),
  f28: scale(28),
  f32: scale(32),
  f64: scale(64),
} as const;

/**
 * Font weights with const assertion for precise literal types
 * Each key maps to exact CSS font-weight values
 */
const weight = {
  semiLow: "400",
  low: "500",
  semi: "600",
  extraSemi: "700",
  extraBold: "800",
  full: "900",
  bold: "bold",
  normal: "normal",
} as const;

/**
 * Derived types for external use (if needed)
 */
export type FontFamily = typeof family;
export type FontSize = typeof size;
export type FontWeight = typeof weight;
export type FontSizeKey = keyof typeof size;
export type FontWeightKey = keyof typeof weight;

export default { family, weight, size };
