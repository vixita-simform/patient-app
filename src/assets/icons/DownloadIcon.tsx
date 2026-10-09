import type { ReactElement } from "react";
import Svg, { G, Line, Path, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface DownloadIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Download icon (24x24 viewBox, stroked).
 * @param {DownloadIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function DownloadIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: DownloadIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <Polyline points="7 10 12 15 17 10" />
        <Line x1="12" x2="12" y1="15" y2="3" />
      </G>
    </Svg>
  );
}
