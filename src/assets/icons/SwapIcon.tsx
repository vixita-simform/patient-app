import type { ReactElement } from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface SwapIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Swap icon (24x24 viewBox, stroked).
 * @param {SwapIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function SwapIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: SwapIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M17 1l4 4-4 4" />
        <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <Path d="M7 23l-4-4 4-4" />
        <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </G>
    </Svg>
  );
}
