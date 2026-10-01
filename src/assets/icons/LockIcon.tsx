import type { ReactElement } from "react";
import Svg, { G, Path, Rect, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface LockIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Lock (padlock) icon (24x24 viewBox, stroked).
 * @param {LockIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function LockIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: LockIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}>
        <Rect height="9" rx="2" width="14" x="5" y="11" />
        <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </G>
    </Svg>
  );
}
