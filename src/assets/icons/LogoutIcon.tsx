import type { ReactElement } from "react";
import Svg, { G, Line, Path, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface LogoutIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Logout icon (24x24 viewBox, stroked).
 * @param {LogoutIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function LogoutIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: LogoutIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <Polyline points="16 17 21 12 16 7" />
        <Line x1="21" x2="9" y1="12" y2="12" />
      </G>
    </Svg>
  );
}
