import type { ReactElement } from "react";
import Svg, { Circle, G, Line, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface HelpIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Help icon (24x24 viewBox, stroked).
 * @param {HelpIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function HelpIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: HelpIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Circle cx="12" cy="12" r="10" />
        <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <Line x1="12" x2="12.01" y1="17" y2="17" />
      </G>
    </Svg>
  );
}
