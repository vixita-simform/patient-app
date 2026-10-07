import type { ReactElement } from 'react';
import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface ShareIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Share icon: three connected nodes (24x24 viewBox, stroked).
 * @param {ShareIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ShareIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: ShareIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Circle cx="6" cy="12" r="2.4" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="6" r="2.4" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="18" r="2.4" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8.1 10.8l7.8-3.6M8.1 13.2l7.8 3.6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
