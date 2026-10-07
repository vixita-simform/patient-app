import type { ReactElement } from 'react';
import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface ClockIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Clock icon (24x24 viewBox, stroked).
 * @param {ClockIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function ClockIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: ClockIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M12 7v5l3 2" />
      </G>
    </Svg>
  );
}
