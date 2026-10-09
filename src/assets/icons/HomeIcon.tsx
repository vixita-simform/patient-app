import type { ReactElement } from "react";
import Svg, { G, Path, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface HomeIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Home icon (24x24 viewBox, stroked).
 * @param {HomeIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function HomeIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: HomeIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <Polyline points="9 22 9 12 15 12 15 22" />
      </G>
    </Svg>
  );
}
