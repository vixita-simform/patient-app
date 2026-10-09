import type { ReactElement } from "react";
import Svg, { G, Line, Rect, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface CalendarIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Calendar icon (24x24 viewBox, stroked).
 * @param {CalendarIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function CalendarIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: CalendarIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
        <Line x1="16" x2="16" y1="2" y2="6" />
        <Line x1="8" x2="8" y1="2" y2="6" />
        <Line x1="3" x2="21" y1="10" y2="10" />
      </G>
    </Svg>
  );
}
