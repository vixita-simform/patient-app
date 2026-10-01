import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "../../hooks";
import { scale } from "../../theme";
import IconButtonStyles from "./IconButtonStyles";
import type { IconButtonProps } from "./IconButtonTypes";

/** Extends the 40px visual target to the 48px minimum touch size. */
const HIT_SLOP = scale(4);

/**
 * Square bordered button that hosts an icon.
 * @param {IconButtonProps} props - icon child, press handler, disabled flag and a11y label.
 * @returns {ReactElement} A React Element.
 */
const IconButton = ({
  children,
  onPress,
  disabled = false,
  accessibilityLabel,
}: IconButtonProps): ReactElement => {
  const { styles } = useTheme(IconButtonStyles);
  const getStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
      StyleSheet.flatten([
        styles.iconBtn,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]),
    [styles, disabled],
  );
  const accessibilityState = useMemo(() => ({ disabled }), [disabled]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      style={getStyle}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

export default IconButton;
