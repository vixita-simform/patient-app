import type { ReactElement } from "react";
import Svg, { Line, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface AlertIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Alert icon: warning triangle with an exclamation mark (24x24 viewBox, stroked).
 * @param {AlertIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function AlertIcon({
  size = 24,
  color = theme.colors.coral,
  strokeWidth = 1.8,
  ...rest
}: AlertIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M12 3.5l9.5 16.5a1 1 0 0 1-.87 1.5H3.37a1 1 0 0 1-.87-1.5L12 3.5z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Line stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} x1="12" x2="12" y1="9.5" y2="13.5" />
      <Line stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} x1="12" x2="12" y1="16.5" y2="16.5" />
    </Svg>
  );
}
