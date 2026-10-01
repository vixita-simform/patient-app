import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import VisitTypeCardStyles from "./VisitTypeCardStyles";
import type { VisitTypeCardProps } from "./VisitTypeCardTypes";

/**
 * Selectable visit-type card: leading icon + radio row, then title and subtitle.
 * @param {VisitTypeCardProps} props - icon, copy, selection state and press handler.
 * @returns {ReactElement} A React Element.
 */
const VisitTypeCard = ({ Icon, iconColor, title, subtitle, active, onPress }: VisitTypeCardProps): ReactElement => {
  const { styles } = useTheme(VisitTypeCardStyles);

  const containerStyle = useMemo(
    () => StyleSheet.flatten([styles.visit, active && styles.visitActive]),
    [styles, active],
  );
  const radioStyle = useMemo(
    () => StyleSheet.flatten([styles.radio, active && styles.visitActiveRadio]),
    [styles, active],
  );

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={containerStyle}
      onPress={onPress}
    >
      <View style={styles.row}>
        <Icon color={iconColor} size={20} />
        <View style={radioStyle} />
      </View>
      <CustomText style={styles.title}>{title}</CustomText>
      <CustomText style={styles.subtitle}>{subtitle}</CustomText>
    </Pressable>
  );
};

export default VisitTypeCard;
