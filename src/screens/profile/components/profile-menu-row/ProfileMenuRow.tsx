import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ChevronRightIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { PROFILE_MENU_TONE } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import ProfileMenuRowStyles from "./ProfileMenuRowStyles";
import type { ProfileMenuRowProps } from "./ProfileMenuRowTypes";

/**
 * Menu row: tinted icon box, title, optional count badge and a chevron.
 * @param {ProfileMenuRowProps} props - id, title, tone, icon, badge and press handler.
 * @returns {ReactElement} A React Element.
 */
const ProfileMenuRow = ({
  id,
  title,
  tone,
  Icon,
  badge,
  isDivided,
  onPress,
}: ProfileMenuRowProps): ReactElement => {
  const { styles, theme } = useTheme(ProfileMenuRowStyles);

  const palette = Colors[theme];
  const boxStyle = {
    [PROFILE_MENU_TONE.green]: styles.ibGreen,
    [PROFILE_MENU_TONE.blue]: styles.ibBlue,
    [PROFILE_MENU_TONE.amber]: styles.ibAmber,
  }[tone];
  const iconColor = {
    [PROFILE_MENU_TONE.green]: palette.green,
    [PROFILE_MENU_TONE.blue]: palette.blue,
    [PROFILE_MENU_TONE.amber]: palette.amberInk,
  }[tone];
  const accessibilityLabel = badge ? `${title}, ${badge}` : title;

  const handlePress = (): void => {
    onPress?.(id);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.menuItem,
        isDivided && styles.menuItemDivider,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={StyleSheet.flatten([styles.iconBox, boxStyle])}>
        <Icon color={iconColor} size={scale(20)} />
      </View>
      <CustomText style={styles.tTitle}>{title}</CustomText>
      {badge ? (
        <View style={styles.badge}>
          <CustomText style={styles.badgeText}>{badge}</CustomText>
        </View>
      ) : null}
      <ChevronRightIcon color={palette.muted} size={scale(20)} />
    </Pressable>
  );
};

export default ProfileMenuRow;
