import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { CustomText } from "../custom-text";
import AvatarStyles from "./AvatarStyles";
import type { AvatarProps } from "./AvatarTypes";

const DEFAULT_SIZE = 40;
const GRADIENT_START = Object.freeze({ x: 0, y: 0 });
const GRADIENT_END = Object.freeze({ x: 1, y: 1 });
/** Initials font size relative to the avatar diameter. */
const INITIALS_RATIO = 0.35;

/**
 * Circular initials avatar with a 135deg gradient.
 * @param {AvatarProps} props - initials, diameter and gradient start colour.
 * @returns {ReactElement} A React Element.
 */
const Avatar = ({
  initials,
  size = DEFAULT_SIZE,
  color,
}: AvatarProps): ReactElement => {
  const { styles, theme } = useTheme(AvatarStyles);
  const colors = useMemo(
    () => [color ?? Colors[theme].primary, Colors[theme].primaryDark] as const,
    [color, theme],
  );
  const avatarStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.avatar,
        { width: scale(size), height: scale(size), borderRadius: scale(size) / 2 },
      ]),
    [styles.avatar, size],
  );
  const textStyle = useMemo(
    () => StyleSheet.flatten([styles.initials, { fontSize: scale(size * INITIALS_RATIO) }]),
    [styles.initials, size],
  );

  return (
    <LinearGradient
      colors={colors}
      end={GRADIENT_END}
      start={GRADIENT_START}
      style={avatarStyle}>
      <CustomText style={textStyle}>{initials}</CustomText>
    </LinearGradient>
  );
};

export default Avatar;
