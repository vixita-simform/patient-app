import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import type { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { CustomText } from '../custom-text';
import { BUTTON_VARIANT } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors } from '../../theme';
import CustomButtonStyles from './CustomButtonStyles';
import type { CustomButtonProps } from './CustomButtonTypes';

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
  loading = false,
  style,
  textStyle,
  icon
}: CustomButtonProps): ReactElement => {
  const { styles, theme } = useTheme(CustomButtonStyles);
  const isDisabled = disabled || loading;
  const variantStyle = variant === BUTTON_VARIANT.line ? styles.line : styles.fill;
  const variantTextStyle = variant === BUTTON_VARIANT.line ? styles.lineText : styles.fillText;

  const getStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
      StyleSheet.flatten([
        styles.base,
        variantStyle,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style
      ]),
    [styles, variantStyle, isDisabled, style]
  );
  const labelStyle = useMemo(
    () => StyleSheet.flatten([styles.textBase, variantTextStyle, textStyle]),
    [styles, variantTextStyle, textStyle]
  );
  const accessibilityState = useMemo(
    () => ({ disabled: isDisabled, busy: loading }),
    [isDisabled, loading]
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      style={getStyle}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === BUTTON_VARIANT.line ? Colors[theme].green : Colors[theme].white}
        />
      ) : (
        icon
      )}
      <CustomText style={labelStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default CustomButton;
