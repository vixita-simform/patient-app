import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface BackIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Back arrow (chevron) icon.
 * @param {BackIconProps} props - size, color and stroke width.
 * @returns {ReactElement} A React Element.
 */
export function BackIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: BackIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
