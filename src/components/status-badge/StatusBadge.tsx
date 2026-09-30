import type { ReactElement } from "react";
import { View } from "react-native";

import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import StatusBadgeStyles from "./StatusBadgeStyles";
import type { StatusBadgeProps } from "./StatusBadgeTypes";

/**
 * Small pill badge (green tone).
 * @param {StatusBadgeProps} props - badge label.
 * @returns {ReactElement} A React Element.
 */
const StatusBadge = ({ label }: StatusBadgeProps): ReactElement => {
  const { styles } = useTheme(StatusBadgeStyles);

  return (
    <View style={styles.badgeGreen}>
      <CustomText style={styles.badgeGreenText}>{label}</CustomText>
    </View>
  );
};

export default StatusBadge;
