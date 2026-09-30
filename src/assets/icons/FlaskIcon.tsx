import type { ReactElement } from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface FlaskIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Flask icon (24x24 viewBox, stroked).
 * @param {FlaskIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function FlaskIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: FlaskIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}>
        <Path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
        <Path d="M7.5 15h9" />
      </G>
    </Svg>
  );
}
