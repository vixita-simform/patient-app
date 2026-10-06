import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useTheme } from "../../hooks";
import { Colors } from "../../theme";
import { CustomText } from "../custom-text";
import { FormField } from "../form-field";
import TextFieldStyles from "./TextFieldStyles";
import type { TextFieldProps } from "./TextFieldTypes";

/**
 * Labelled single-line text field with focus/error borders, optional leading content
 * (inside the same border) and trailing icon or text. With `onPress` it becomes a
 * read-only button that opens something (e.g. a date picker).
 * @param {TextFieldProps} props - value, handlers, validation error and slots.
 * @returns {ReactElement} A React Element.
 */
const TextField = ({
  label,
  value,
  onChangeText,
  onPress,
  accessibilityLabel = label,
  placeholder,
  maxLength,
  keyboardType,
  autoCapitalize,
  error,
  leading,
  trailingIcon,
  trailingText,
  onBlur,
  onSubmitEditing,
}: TextFieldProps): ReactElement => {
  const { styles, theme } = useTheme(TextFieldStyles);
  const [isFocused, setIsFocused] = useState(false);
  const isPressable = Boolean(onPress);
  const hasError = Boolean(error);
  // Error border wins over focus: it is listed last.
  const inputStyle = useMemo(
    () => StyleSheet.flatten([styles.input, isFocused && styles.inputFocus, hasError && styles.inputError]),
    [styles, isFocused, hasError],
  );
  const textInputStyle = useMemo(
    () => (isPressable ? StyleSheet.flatten([styles.textInput, styles.noPointerEvents]) : styles.textInput),
    [styles, isPressable],
  );
  const accessibilityValue = useMemo(() => ({ text: value }), [value]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // In pressable mode the wrapping Pressable carries the label and value, so the
  // read-only TextInput is hidden from assistive tech to avoid a duplicate stop.
  const content = (
    <>
      {leading}
      <TextInput
        accessibilityElementsHidden={isPressable}
        accessibilityLabel={isPressable ? undefined : accessibilityLabel}
        accessible={!isPressable}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={!isPressable}
        importantForAccessibility={isPressable ? "no-hide-descendants" : "auto"}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={Colors[theme].muted}
        returnKeyType="done"
        style={textInputStyle}
        value={value}
        onBlur={handleBlur}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onSubmitEditing={onSubmitEditing}
      />
      {trailingIcon}
      {trailingText ? <CustomText style={styles.trailingText}>{trailingText}</CustomText> : null}
    </>
  );

  return (
    <FormField error={error} label={label}>
      {onPress ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityValue={accessibilityValue}
          style={inputStyle}
          onPress={onPress}
        >
          {content}
        </Pressable>
      ) : (
        <View style={inputStyle}>{content}</View>
      )}
    </FormField>
  );
};

export default TextField;
