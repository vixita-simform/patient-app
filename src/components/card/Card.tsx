import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "../../hooks";
import CardStyles from "./CardStyles";
import type { CardProps } from "./CardTypes";

/**
 * Bordered white surface; pressable when `onPress` is given.
 * @param {CardProps} props - children, style override, optional press handler and a11y props.
 * @returns {ReactElement} A React Element.
 */
const Card = ({
  children,
  style,
  onPress,
  accessibilityLabel,
  accessibilityState,
}: CardProps): ReactElement => {
  const { styles } = useTheme(CardStyles);
  const cardStyle = useMemo(() => StyleSheet.flatten([styles.card, style]), [styles.card, style]);

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        style={({ pressed }) => (pressed ? [cardStyle, styles.pressed] : cardStyle)}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
