import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface SendIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
}

/**
 * Send icon (24x24 viewBox, filled glyph, so it takes no strokeWidth).
 * @param {SendIconProps} props - size, color plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function SendIcon({
  size = 24,
  color = theme.colors.navy,
  ...rest
}: SendIconProps): ReactElement {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </Svg>
  );
}
