import type { ReactElement } from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface ChevronRightIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Chevron right icon (24x24 viewBox, stroked).
 * @param {ChevronRightIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ChevronRightIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: ChevronRightIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M9 18l6-6-6-6" />
      </G>
    </Svg>
  );
}
