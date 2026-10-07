import type { ReactElement } from 'react';
import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface HelpIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Help icon (24x24 viewBox, stroked).
 * @param {HelpIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function HelpIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: HelpIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Circle cx="12" cy="12" r="9" />
        <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.01" />
      </G>
    </Svg>
  );
}
