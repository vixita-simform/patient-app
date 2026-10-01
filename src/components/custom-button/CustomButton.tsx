import type { ReactElement } from "react";
import { useCallback } from "react";
import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet } from "react-native";

import { CustomText } from "../custom-text";
import { BUTTON_VARIANT } from "../../constants";
import { useTheme } from "../../hooks";
import CustomButtonStyles from "./CustomButtonStyles";
import type { CustomButtonProps } from "./CustomButtonTypes";

/**
 * Pressable button with `fill` and `line` variants. Sizing comes from padding,
 * not a fixed height, so callers can control layout via `style`.
 * @param {CustomButtonProps} props - label, variant, press handler and style overrides.
 * @returns {ReactElement} A React Element.
 */
const CustomButton = ({
  label,
  variant = BUTTON_VARIANT.fill,
  onPress,
  accessibilityLabel,
  disabled,
  style,
  textStyle,
  icon,
}: CustomButtonProps): ReactElement => {
  const { styles } = useTheme(CustomButtonStyles);
  const variantStyle = variant === BUTTON_VARIANT.line ? styles.line : styles.fill;
  const variantTextStyle =
    variant === BUTTON_VARIANT.line ? styles.lineText : styles.fillText;

  const getStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
      StyleSheet.flatten([
        styles.base,
        variantStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]),
    [styles, variantStyle, disabled, style],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={getStyle}
      onPress={onPress}
    >
      {icon}
      <CustomText style={[styles.textBase, variantTextStyle, textStyle]}>{label}</CustomText>
    </Pressable>
  );
};

export default CustomButton;
