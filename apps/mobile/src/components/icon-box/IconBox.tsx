import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ICON_TONE } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import IconBoxStyles from './IconBoxStyles';
import type { IconBoxProps } from './IconBoxTypes';

/** Maps a tone to its soft background style key and its icon color token. */
const TONE = Object.freeze({
  [ICON_TONE.green]: { box: 'iconBoxGreen', icon: 'green' },
  [ICON_TONE.blue]: { box: 'iconBoxBlue', icon: 'blue' },
  [ICON_TONE.amber]: { box: 'iconBoxAmber', icon: 'amberInk' },
  [ICON_TONE.coral]: { box: 'iconBoxCoral', icon: 'coral' }
} as const);

/**
 * 44px rounded square with a soft tinted background and a matching icon color.
 * @param {IconBoxProps} props - the icon component and its tone.
 * @returns {ReactElement} A React Element.
 */
const IconBox = ({ Icon, tone }: IconBoxProps): ReactElement => {
  const { styles, theme } = useTheme(IconBoxStyles);
  const boxStyle = useMemo(
    () => StyleSheet.flatten([styles.iconBox, styles[TONE[tone].box]]),
    [styles, tone]
  );

  return (
    <View style={boxStyle}>
      <Icon color={Colors[theme][TONE[tone].icon]} size={scale(20)} />
    </View>
  );
};

export default IconBox;
