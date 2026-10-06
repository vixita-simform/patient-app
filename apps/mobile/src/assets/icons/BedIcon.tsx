import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface BedIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Hospital bed icon (24x24 viewBox, stroked).
 * @param {BedIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function BedIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: BedIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M3 18v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Path
        d="M11 14h8a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Path d="M3 12V6M21 20v-2M3 20v-2" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
      <Path d="M3 18h18" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
    </Svg>
  );
}
