import type { ReactElement } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface HomeIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Home icon (24x24 viewBox, stroked).
 * @param {HomeIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function HomeIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: HomeIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
