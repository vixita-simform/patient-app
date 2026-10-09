import type { ReactElement } from "react";
import Svg, { Circle, G, Line, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface SearchIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Search icon (24x24 viewBox, stroked).
 * @param {SearchIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function SearchIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: SearchIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Circle cx="11" cy="11" r="8" />
        <Line x1="21" x2="16.65" y1="21" y2="16.65" />
      </G>
    </Svg>
  );
}
