import type { ReactElement } from "react";
import Svg, { G, Path, Rect, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface ServicesIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Services icon (24x24 viewBox, stroked).
 * @param {ServicesIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ServicesIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: ServicesIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Rect height="14" rx="2" ry="2" width="20" x="2" y="7" />
        <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </G>
    </Svg>
  );
}
