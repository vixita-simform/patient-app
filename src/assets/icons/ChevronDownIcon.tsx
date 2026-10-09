import type { ReactElement } from "react";
import Svg, { G, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface ChevronDownIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Chevron down icon (24x24 viewBox, stroked).
 * @param {ChevronDownIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ChevronDownIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: ChevronDownIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Polyline points="6 9 12 15 18 9" />
      </G>
    </Svg>
  );
}
