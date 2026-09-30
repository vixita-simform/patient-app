import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface FilterIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Filter (sliders) icon.
 * @param {FilterIconProps} props - size, color and stroke width.
 * @returns {ReactElement} A React Element.
 */
export function FilterIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: FilterIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M4 6h16M7 12h10M10 18h4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
