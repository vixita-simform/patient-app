import type { ReactElement } from 'react';
import Svg, { Path, Rect, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface CalendarIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Calendar icon (24x24 viewBox, stroked).
 * @param {CalendarIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function CalendarIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: CalendarIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Rect
        height={16}
        rx={2}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        width={18}
        x={3}
        y={5}
      />
      <Path
        d="M3 10h18M8 3v4M16 3v4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
