import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors } from "../../../../theme";
import CountryCodePicker from "../country-code-picker/CountryCodePicker";
import AuthInputStyles from "./AuthInputStyles";
import type { AuthInputProps } from "./AuthInputTypes";

/**
 * Labelled field whose country-code picker and text input share one bordered container
 * (single focus and error state). Without `country` it renders as a plain text field.
 * @param {AuthInputProps} props - value, handlers, validation error and optional country picker data.
 * @returns {ReactElement} A React Element.
 */
const AuthInput = ({
  label,
  value,
  placeholder,
  maxLength,
  keyboardType,
  autoCapitalize,
  error,
  country,
  countries,
  onCountrySelect,
  onChangeText,
  onBlur,
  onSubmitEditing,
}: AuthInputProps): ReactElement => {
  const { styles, theme } = useTheme(AuthInputStyles);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);
  // Error border wins over focus: it is listed last.
  const inputStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.input,
        isFocused && styles.inputFocus,
        hasError && styles.inputError,
      ]),
    [styles.input, styles.inputFocus, styles.inputError, isFocused, hasError],
  );

  return (
    <View style={styles.field}>
      <CustomText style={styles.fieldLabel}>{label}</CustomText>
      <View style={inputStyle}>
        {country && countries && onCountrySelect ? (
          <>
            <CountryCodePicker
              countries={countries}
              selected={country}
              onSelect={onCountrySelect}
            />
            <View style={styles.vLine} />
          </>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={Colors[theme].muted}
          returnKeyType="done"
          style={styles.textInput}
          value={value}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {hasError ? <CustomText style={styles.errorText}>{error}</CustomText> : null}
    </View>
  );
};

export default AuthInput;
