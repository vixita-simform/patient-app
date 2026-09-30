import type { ReactElement } from "react";
import Svg, { Circle, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface SearchIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Magnifier icon.
 * @param {SearchIconProps} props - size, color and stroke width.
 * @returns {ReactElement} A React Element.
 */
export function SearchIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: SearchIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Path
        d="M20 20l-3.5-3.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
