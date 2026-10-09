import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { TeamIcon } from "../../../../assets/icons";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import GroupAvatarStyles from "./GroupAvatarStyles";
import type { GroupAvatarProps } from "./GroupAvatarTypes";

/**
 * Circular avatar with a team icon, used for group threads.
 * @param {GroupAvatarProps} props - diameter, icon size (both unscaled) and muted flag.
 * @returns {ReactElement} A React Element.
 */
const GroupAvatar = ({
  size,
  iconSize,
  muted = false,
}: GroupAvatarProps): ReactElement => {
  const { styles, theme } = useTheme(GroupAvatarStyles);
  const { colors } = themes[theme];
  const circleStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.circle,
        muted && styles.circleMuted,
        {
          width: scale(size),
          height: scale(size),
          borderRadius: scale(size) / 2,
        },
      ]),
    [styles, muted, size],
  );

  return (
    <View style={circleStyle}>
      <TeamIcon
        color={muted ? colors.textSecondary : colors.primary}
        size={scale(iconSize)}
      />
    </View>
  );
};

export default GroupAvatar;
