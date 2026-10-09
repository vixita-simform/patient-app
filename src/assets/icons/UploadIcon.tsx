import type { ReactElement } from "react";
import Svg, { G, Line, Path, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface UploadIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Upload icon (24x24 viewBox, stroked).
 * @param {UploadIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function UploadIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: UploadIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <Polyline points="17 8 12 3 7 8" />
        <Line x1="12" x2="12" y1="3" y2="15" />
      </G>
    </Svg>
  );
}
