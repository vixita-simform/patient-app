import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CustomText } from '../../../../components';
import { QUICK_ACTION_VARIANT } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import QuickActionTileStyles from './QuickActionTileStyles';
import type { QuickActionTileProps, QuickActionVariant } from './QuickActionTileTypes';

const ICON_BOX_STYLE_KEY = Object.freeze({
  [QUICK_ACTION_VARIANT.green]: 'iconBoxGreen',
  [QUICK_ACTION_VARIANT.blue]: 'iconBoxBlue',
  [QUICK_ACTION_VARIANT.amber]: 'iconBoxAmber',
  [QUICK_ACTION_VARIANT.emergency]: 'iconBoxEmergency'
} as const satisfies Record<QuickActionVariant, string>);

const ICON_COLOR_KEY = Object.freeze({
  [QUICK_ACTION_VARIANT.green]: 'green',
  [QUICK_ACTION_VARIANT.blue]: 'blue',
  [QUICK_ACTION_VARIANT.amber]: 'amberInk',
  [QUICK_ACTION_VARIANT.emergency]: 'white'
} as const satisfies Record<QuickActionVariant, string>);

/**
 * Quick action tile with a tinted icon box and label; the emergency variant is solid coral.
 * @param {QuickActionTileProps} props - label, variant, icon and press handler.
 * @returns {ReactElement} A React Element.
 */
const QuickActionTile = ({ label, variant, Icon, onPress }: QuickActionTileProps): ReactElement => {
  const { styles, theme } = useTheme(QuickActionTileStyles);
  const isEmergency = variant === QUICK_ACTION_VARIANT.emergency;
  const iconColor = Colors[theme][ICON_COLOR_KEY[variant]];
  const tileStyle = useMemo(
    () => StyleSheet.flatten([styles.quickTile, isEmergency && styles.quickTileEmergency]),
    [styles, isEmergency]
  );
  const iconBoxStyle = useMemo(
    () => StyleSheet.flatten([styles.iconBox, styles[ICON_BOX_STYLE_KEY[variant]]]),
    [styles, variant]
  );
  const titleStyle = useMemo(
    () => StyleSheet.flatten([styles.textTitle, isEmergency && styles.textTitleEmergency]),
    [styles, isEmergency]
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={tileStyle}
      onPress={onPress}
    >
      <View style={iconBoxStyle}>
        <Icon color={iconColor} size={scale(20)} />
      </View>
      <CustomText style={titleStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default QuickActionTile;
