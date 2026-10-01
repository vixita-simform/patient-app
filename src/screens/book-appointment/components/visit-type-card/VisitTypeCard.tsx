import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { scale } from "../../../../theme";
import VisitTypeCardStyles from "./VisitTypeCardStyles";
import type { VisitTypeCardProps } from "./VisitTypeCardTypes";

/**
 * Selectable visit-type card: leading icon + radio row, then title and subtitle.
 * @param {VisitTypeCardProps} props - visit mode id, icon, copy, selection state and press handler.
 * @returns {ReactElement} A React Element.
 */
const VisitTypeCard = ({ id, Icon, iconColor, title, subtitle, active, onPress }: VisitTypeCardProps): ReactElement => {
  const { styles } = useTheme(VisitTypeCardStyles);
  const handlePress = () => onPress(id);

  const containerStyle = useMemo(
    () => StyleSheet.flatten([styles.visit, active && styles.visitActive]),
    [styles, active],
  );
  const radioStyle = useMemo(
    () => StyleSheet.flatten([styles.radio, active && styles.visitActiveRadio]),
    [styles, active],
  );
  const accessibilityState = useMemo(() => ({ checked: active }), [active]);

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="radio"
      accessibilityState={accessibilityState}
      style={containerStyle}
      onPress={handlePress}
    >
      <View style={styles.row}>
        <Icon color={iconColor} size={scale(20)} />
        <View style={radioStyle} />
      </View>
      <CustomText style={styles.title}>{title}</CustomText>
      <CustomText style={styles.subtitle}>{subtitle}</CustomText>
    </Pressable>
  );
};

export default VisitTypeCard;
