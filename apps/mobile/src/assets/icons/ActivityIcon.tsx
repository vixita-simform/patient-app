import type { ReactElement } from 'react';
import Svg, { G, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface ActivityIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Activity icon (24x24 viewBox, stroked).
 * @param {ActivityIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ActivityIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: ActivityIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Path d="M3 12h4l3-8 4 16 3-8h4" />
      </G>
    </Svg>
  );
}
