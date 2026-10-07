import type { ReactElement } from 'react';
import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface PinIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Map pin icon (24x24 viewBox, stroked).
 * @param {PinIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function PinIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: PinIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
        <Circle cx="12" cy="10" r="2.5" />
      </G>
    </Svg>
  );
}
