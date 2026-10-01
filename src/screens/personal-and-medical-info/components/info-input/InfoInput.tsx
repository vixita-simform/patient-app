import type { ReactElement } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import InfoInputStyles from "./InfoInputStyles";
import type { InfoInputProps } from "./InfoInputTypes";

/**
 * Bordered single-line text input with an optional trailing icon or text.
 * @param {InfoInputProps} props - value, change handler and trailing content.
 * @returns {ReactElement} A React Element.
 */
const InfoInput = ({
  value,
  onChangeText,
  onPress,
  accessibilityLabel,
  trailingIcon,
  trailingText,
}: InfoInputProps): ReactElement => {
  const { styles } = useTheme(InfoInputStyles);
  const isPressable = Boolean(onPress);

  // In pressable mode the wrapping Pressable carries the label and value, so the
  // read-only TextInput is hidden from assistive tech to avoid a duplicate stop.
  const content = (
    <>
      <TextInput
        accessibilityElementsHidden={isPressable}
        accessibilityLabel={isPressable ? undefined : accessibilityLabel}
        accessible={!isPressable}
        editable={!isPressable}
        importantForAccessibility={isPressable ? "no-hide-descendants" : "auto"}
        style={isPressable ? StyleSheet.flatten([styles.flex1, styles.noPointerEvents]) : styles.flex1}
        value={value}
        onChangeText={onChangeText}
      />
      {trailingIcon}
      {trailingText ? <CustomText style={styles.tSub}>{trailingText}</CustomText> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityValue={{ text: value }}
        style={styles.input}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.input}>{content}</View>;
};

export default InfoInput;
