import type { ReactElement } from "react";
import Svg, { Circle, G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface UsersIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Users icon (24x24 viewBox, stroked).
 * @param {UsersIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function UsersIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: UsersIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}>
        <Circle cx="9" cy="8" r="4" />
        <Path d="M2 21c0-4 3-6 7-6s7 2 7 6" />
        <Path d="M16 4a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.7" />
      </G>
    </Svg>
  );
}
