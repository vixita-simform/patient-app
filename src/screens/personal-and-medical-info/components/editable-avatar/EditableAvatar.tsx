import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { EditIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import EditableAvatarStyles from "./EditableAvatarStyles";
import type { EditableAvatarProps } from "./EditableAvatarTypes";

/**
 * 88px navy initials avatar with a pen badge to change the photo. The shared
 * Avatar only supports 44/48px, so this larger variant lives with the screen.
 * @param {EditableAvatarProps} props - initials, a11y label and press handler.
 * @returns {ReactElement} A React Element.
 */
const EditableAvatar = ({
  initials,
  accessibilityLabel,
  onPress,
}: EditableAvatarProps): ReactElement => {
  const { styles, theme } = useTheme(EditableAvatarStyles);

  return (
    <View style={styles.avatarEdit}>
      <View style={styles.avatar}>
        <CustomText style={styles.avatarText}>{initials}</CustomText>
      </View>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={styles.avatarPen}
        onPress={onPress}
      >
        <EditIcon color={Colors[theme].white} size={scale(16)} />
      </Pressable>
    </View>
  );
};

export default EditableAvatar;
