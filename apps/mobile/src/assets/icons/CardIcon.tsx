import type { ReactElement } from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface CardIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Payment card icon (24x24 viewBox, stroked). Used for billing notifications.
 * @param {CardIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function CardIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: CardIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Rect
        height={14}
        rx={2}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        width={20}
        x={2}
        y={5}
      />
      <Path
        d="M2 10h20M6 15h4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
