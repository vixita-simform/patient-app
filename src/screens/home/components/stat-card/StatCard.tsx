import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { Pressable } from "react-native";

import { AppText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import StatCardStyles from "./StatCardStyles";
import type { StatCardProps } from "./StatCardTypes";

const GRADIENT_START = Object.freeze({ x: 0, y: 0 });
const GRADIENT_END = Object.freeze({ x: 1, y: 1 });

/**
 * Gradient summary tile with a label, big number and caption.
 * @param {StatCardProps} props - texts, gradient colours and press handler.
 * @returns {ReactElement} A React Element.
 */
const StatCard = ({
  label,
  value,
  caption,
  colors,
  onPress,
}: StatCardProps): ReactElement => {
  const { styles } = useTheme(StatCardStyles);

  return (
    <Pressable
      accessibilityLabel={`${label}${Strings.Common.listSeparator}${value}`}
      accessibilityRole="button"
      style={styles.pressable}
      onPress={onPress}>
      <LinearGradient
        colors={colors}
        end={GRADIENT_END}
        start={GRADIENT_START}
        style={styles.card}>
        <AppText style={styles.label}>{label}</AppText>
        <AppText style={styles.value}>{value}</AppText>
        <AppText style={styles.caption}>{caption}</AppText>
      </LinearGradient>
    </Pressable>
  );
};

export default StatCard;
