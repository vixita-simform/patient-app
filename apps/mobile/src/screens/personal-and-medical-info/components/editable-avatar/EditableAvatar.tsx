import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EditIcon } from '../../../../assets/icons';
import { Avatar } from '../../../../components';
import { AVATAR_SIZE, AVATAR_TONE } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import EditableAvatarStyles from './EditableAvatarStyles';
import type { EditableAvatarProps } from './EditableAvatarTypes';

/** Grows the 32px pen badge to the 44pt minimum touch target. */
const PEN_HIT_SLOP = scale(6);

/**
 * Extra-large navy initials avatar with a pen badge to change the photo.
 * @param {EditableAvatarProps} props - initials, a11y label and press handler.
 * @returns {ReactElement} A React Element.
 */
const EditableAvatar = ({
  initials,
  accessibilityLabel,
  onPress
}: EditableAvatarProps): ReactElement => {
  const { styles, theme } = useTheme(EditableAvatarStyles);
  const isDisabled = !onPress;
  const penStyle = useMemo(
    () =>
      isDisabled
        ? StyleSheet.flatten([styles.avatarPen, styles.avatarPenDisabled])
        : styles.avatarPen,
    [styles, isDisabled]
  );
  const accessibilityState = useMemo(() => ({ disabled: isDisabled }), [isDisabled]);

  return (
    <View style={styles.avatarEdit}>
      <Avatar initials={initials} size={AVATAR_SIZE.xLarge} tone={AVATAR_TONE.navy} />
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        disabled={isDisabled}
        hitSlop={PEN_HIT_SLOP}
        style={penStyle}
        onPress={onPress}
      >
        <EditIcon color={Colors[theme].white} size={scale(16)} />
      </Pressable>
    </View>
  );
};

export default EditableAvatar;
