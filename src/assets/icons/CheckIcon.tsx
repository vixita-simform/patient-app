import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface CheckIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Checkmark (tick) icon.
 * @param {CheckIconProps} props - size, color and stroke width.
 * @returns {ReactElement} A React Element.
 */
export function CheckIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: CheckIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="m5 12 5 5 9-10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
