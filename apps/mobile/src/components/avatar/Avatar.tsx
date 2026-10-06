import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { AVATAR_SIZE, AVATAR_TONE } from "../../constants";
import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import AvatarStyles from "./AvatarStyles";
import type { AvatarProps } from "./AvatarTypes";

/** Maps a tone to its background style key. */
const TONE_STYLE_KEY = Object.freeze({
  [AVATAR_TONE.navy]: "avatarNavy",
  [AVATAR_TONE.green]: "avatarGreen",
  [AVATAR_TONE.blue]: "avatarBlue",
  [AVATAR_TONE.amber]: "avatarAmber",
} as const);

/** Maps a size to its container and initials style keys. */
const SIZE_STYLE_KEY = Object.freeze({
  [AVATAR_SIZE.compact]: { container: "avatarCompact", text: "avatarText" },
  [AVATAR_SIZE.regular]: { container: "avatarRegular", text: "avatarText" },
  [AVATAR_SIZE.large]: { container: "avatarLarge", text: "avatarTextLarge" },
  [AVATAR_SIZE.xLarge]: { container: "avatarXLarge", text: "avatarTextXLarge" },
} as const);

/**
 * Circular initials avatar.
 * @param {AvatarProps} props - initials, tone and size.
 * @returns {ReactElement} A React Element.
 */
const Avatar = ({
  initials,
  tone = AVATAR_TONE.green,
  size = AVATAR_SIZE.regular,
}: AvatarProps): ReactElement => {
  const { styles } = useTheme(AvatarStyles);
  const sizeKey = SIZE_STYLE_KEY[size];
  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([styles.avatar, styles[sizeKey.container], styles[TONE_STYLE_KEY[tone]]]),
    [styles, sizeKey, tone],
  );

  return (
    <View style={containerStyle}>
      <CustomText style={styles[sizeKey.text]}>{initials}</CustomText>
    </View>
  );
};

export default Avatar;
