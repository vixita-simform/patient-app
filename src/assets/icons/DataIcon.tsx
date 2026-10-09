import type { ReactElement } from "react";
import Svg, { Ellipse, G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface DataIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Data icon (24x24 viewBox, stroked).
 * @param {DataIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function DataIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: DataIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Ellipse cx="12" cy="5" rx="9" ry="3" />
        <Path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <Path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </G>
    </Svg>
  );
}
