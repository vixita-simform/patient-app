import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import type { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronRightIcon } from '../../../../assets/icons';
import { CustomText, IconBox } from '../../../../components';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import ProfileMenuRowStyles from './ProfileMenuRowStyles';
import type { ProfileMenuRowProps } from './ProfileMenuRowTypes';

/**
 * Menu row: tinted icon box, title, optional count badge and a chevron.
 * @param {ProfileMenuRowProps} props - id, title, tone, icon, badge, enabled flag and press handler.
 * @returns {ReactElement} A React Element.
 */
const ProfileMenuRow = ({
  id,
  title,
  tone,
  Icon,
  badge,
  isDivided,
  isEnabled = true,
  onPress
}: ProfileMenuRowProps): ReactElement => {
  const { styles, theme } = useTheme(ProfileMenuRowStyles);
  const isDisabled = !isEnabled || !onPress;
  const accessibilityLabel = badge ? `${title}, ${badge}` : title;
  const accessibilityState = useMemo(() => ({ disabled: isDisabled }), [isDisabled]);

  const getStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
      StyleSheet.flatten([
        styles.menuItem,
        isDivided && styles.menuItemDivider,
        pressed && styles.pressed,
        isDisabled && styles.disabled
      ]),
    [styles, isDivided, isDisabled]
  );

  const handlePress = useCallback((): void => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      style={getStyle}
      onPress={handlePress}
    >
      <IconBox Icon={Icon} tone={tone} />
      <CustomText style={styles.tTitle}>{title}</CustomText>
      {badge ? (
        <View style={styles.badge}>
          <CustomText style={styles.badgeText}>{badge}</CustomText>
        </View>
      ) : null}
      <ChevronRightIcon color={Colors[theme].muted} size={scale(20)} />
    </Pressable>
  );
};

export default ProfileMenuRow;
