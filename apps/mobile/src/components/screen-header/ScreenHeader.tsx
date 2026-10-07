import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackIcon } from '../../assets/icons';
import { SCREEN_HEADER_VARIANT, Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import { CustomText } from '../custom-text';
import { IconButton } from '../icon-button';
import ScreenHeaderStyles from './ScreenHeaderStyles';
import type { ScreenHeaderProps } from './ScreenHeaderTypes';

/**
 * Screen header: optional back button, title and an optional trailing action.
 * @param {ScreenHeaderProps} props - title, back handler, trailing action and variant.
 * @returns {ReactElement} A React Element.
 */
const ScreenHeader = ({
  title,
  onBackPress,
  right,
  variant = SCREEN_HEADER_VARIANT.centered
}: ScreenHeaderProps): ReactElement => {
  const { styles, theme } = useTheme(ScreenHeaderStyles);
  const isCentered = variant === SCREEN_HEADER_VARIANT.centered;
  const titleStyle = useMemo(
    () => (isCentered ? styles.title : StyleSheet.flatten([styles.title, styles.titleLarge])),
    [styles, isCentered]
  );
  const spacer = isCentered ? <View style={styles.slotSpacer} /> : null;

  return (
    <View style={styles.header}>
      {onBackPress ? (
        <IconButton accessibilityLabel={Strings.Common.back} onPress={onBackPress}>
          <BackIcon color={Colors[theme].navy} size={scale(20)} />
        </IconButton>
      ) : (
        spacer
      )}
      <CustomText accessibilityRole="header" style={titleStyle}>
        {title}
      </CustomText>
      {right ?? spacer}
    </View>
  );
};

export default ScreenHeader;
