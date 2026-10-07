import type { ReactElement } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface CloseIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Close (cross) icon, 24x24 viewBox, stroked.
 * @param {CloseIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function CloseIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: CloseIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
