import type { ReactElement } from 'react';
import Svg, { G, Path, Rect, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface VideoIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Video camera icon (24x24 viewBox, stroked).
 * @param {VideoIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function VideoIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: VideoIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Rect height="12" rx="2" width="14" x="2" y="6" />
        <Path d="m16 10 6-3v10l-6-3z" />
      </G>
    </Svg>
  );
}
