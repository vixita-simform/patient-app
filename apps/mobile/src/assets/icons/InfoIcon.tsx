import type { ReactElement } from 'react';
import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface InfoIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Info (circled i) icon (24x24 viewBox, stroked).
 * @param {InfoIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function InfoIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: InfoIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Circle cx="12" cy="12" r="9" />
        <Path d="M12 11v5M12 8h.01" />
      </G>
    </Svg>
  );
}
