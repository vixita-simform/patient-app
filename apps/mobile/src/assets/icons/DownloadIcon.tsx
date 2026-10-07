import type { ReactElement } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

import { theme } from '../../theme';

interface DownloadIconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Download icon: down arrow onto a baseline (24x24 viewBox, stroked).
 * @param {DownloadIconProps} props - size, color, strokeWidth plus any SvgProps.
 * @returns {ReactElement} The SVG element.
 */
export function DownloadIcon({
  size = 24,
  color = theme.colors.navy,
  strokeWidth = 1.8,
  ...rest
}: DownloadIconProps): ReactElement {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...rest}>
      <Path
        d="M12 3.5v11m0 0l-4-4m4 4l4-4M4.5 17v2.2A1.3 1.3 0 0 0 5.8 20.5h12.4A1.3 1.3 0 0 0 19.5 19.2V17"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
