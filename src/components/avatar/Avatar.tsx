import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import AvatarStyles from "./AvatarStyles";
import type { AvatarProps } from "./AvatarTypes";

/** Maps a tone to its background style key. */
const TONE_STYLE_KEY = Object.freeze({
  navy: "avatarNavy",
  green: "avatarGreen",
  blue: "avatarBlue",
  amber: "avatarAmber",
} as const);

/**
 * Circular initials avatar.
 * @param {AvatarProps} props - initials, tone and size.
 * @returns {ReactElement} A React Element.
 */
const Avatar = ({
  initials,
  tone = "green",
  size = "regular",
}: AvatarProps): ReactElement => {
  const { styles } = useTheme(AvatarStyles);
  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.avatar,
        styles[TONE_STYLE_KEY[tone]],
        size === "compact" && styles.avatarSize44,
      ]),
    [styles, tone, size],
  );

  return (
    <View style={containerStyle}>
      <CustomText style={styles.avatarText}>{initials}</CustomText>
    </View>
  );
};

export default Avatar;
