import type { ReactElement } from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface PaperclipIconProps extends Omit<
  SvgProps,
  "width" | "height" | "color"
> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Paperclip icon (24x24 viewBox, stroked).
 * @param {PaperclipIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function PaperclipIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 2,
  ...rest
}: PaperclipIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
      </G>
    </Svg>
  );
}
