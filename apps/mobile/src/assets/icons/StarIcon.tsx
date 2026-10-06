import type { ReactElement } from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { theme } from "../../theme";

interface StarIconProps extends Omit<SvgProps, "width" | "height" | "color"> {
  size?: number;
  color?: string;
}

/**
 * Filled star icon (rating).
 * @param {StarIconProps} props - size and fill color.
 * @returns {ReactElement} A React Element.
 */
export function StarIcon({
  size = 24,
  color = theme.colors.amber,
  ...rest
}: StarIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={color}
      />
    </Svg>
  );
}
