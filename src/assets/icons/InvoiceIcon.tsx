import type { ReactElement } from "react";
import Svg, { G, Line, Path, Polyline, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface InvoiceIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Invoice icon (24x24 viewBox, stroked).
 * @param {InvoiceIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function InvoiceIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: InvoiceIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <Polyline points="14 2 14 8 20 8" />
        <Line x1="16" x2="8" y1="13" y2="13" />
        <Line x1="16" x2="8" y1="17" y2="17" />
      </G>
    </Svg>
  );
}
