import type { ReactElement } from "react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CheckIcon, TeamIcon } from "../../assets/icons";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { scale, theme } from "../../theme";
import { fillTemplate } from "../../utils";
import { CustomText } from "../custom-text";
import RecipientPickerStyles from "./RecipientPickerStyles";
import type { RecipientPickerProps, RecipientRowProps } from "./RecipientPickerTypes";

const TEAM_ICON_SIZE = scale(14);
const CHECK_ICON_SIZE = scale(11);
const CHECK_STROKE_WIDTH = 4;

/**
 * One checkbox row; memoized so unchanged rows skip re-rendering when another row toggles.
 * @param {RecipientRowProps} props - recipient, checked state and toggle handler.
 * @returns {ReactElement} A React Element.
 */
const RecipientRow = memo(function RecipientRow({
  recipient,
  checked,
  onToggle,
}: RecipientRowProps): ReactElement {
  const { styles } = useTheme(RecipientPickerStyles);
  const rowStyle = useMemo(
    () => StyleSheet.flatten([styles.row, checked && styles.rowOn]),
    [styles.row, styles.rowOn, checked],
  );
  const checkboxStyle = useMemo(
    () => StyleSheet.flatten([styles.checkbox, checked && styles.checkboxOn]),
    [styles.checkbox, styles.checkboxOn, checked],
  );
  const onPress = useCallback(() => onToggle(recipient.id), [onToggle, recipient.id]);

  return (
    <Pressable
      accessibilityLabel={recipient.label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={rowStyle}
      onPress={onPress}
    >
      <View style={checkboxStyle}>
        {checked ? (
          <CheckIcon
            color={theme.colors.white}
            size={CHECK_ICON_SIZE}
            strokeWidth={CHECK_STROKE_WIDTH}
          />
        ) : null}
      </View>
      <View style={styles.info}>
        <CustomText style={styles.label}>{recipient.label}</CustomText>
        <CustomText style={styles.desc}>{recipient.desc}</CustomText>
      </View>
    </Pressable>
  );
});

/**
 * Recipient selector: a single "Shared with" row when there is one recipient,
 * otherwise checkbox rows plus a hint line.
 * @param {RecipientPickerProps} props - recipients, selected ids and change handler.
 * @returns {ReactElement} A React Element.
 */
const RecipientPicker = ({
  recipients,
  value,
  onChange,
}: RecipientPickerProps): ReactElement => {
  const { styles } = useTheme(RecipientPickerStyles);
  const hasValue = value.length > 0;

  // Latest selection in a ref so `toggle` stays stable and memoized rows skip re-renders.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const toggle = useCallback(
    (id: string): void => {
      const current = valueRef.current;
      onChange(current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
    },
    [onChange],
  );
  const hintStyle = useMemo(
    () => StyleSheet.flatten([styles.hint, !hasValue && styles.hintError]),
    [styles.hint, styles.hintError, hasValue],
  );

  if (recipients.length === 1) {
    return (
      <View style={styles.single}>
        <TeamIcon color={theme.colors.primary} size={TEAM_ICON_SIZE} />
        <CustomText style={styles.singleText}>
          {fillTemplate(Strings.RecipientPicker.sharedWith, { name: recipients[0].label })}
        </CustomText>
      </View>
    );
  }

  return (
    <View>
      {recipients.map((r) => (
        <RecipientRow
          checked={value.includes(r.id)}
          key={r.id}
          recipient={r}
          onToggle={toggle}
        />
      ))}
      <CustomText style={hintStyle}>
        {hasValue ? Strings.RecipientPicker.hintSelected : Strings.RecipientPicker.hintEmpty}
      </CustomText>
    </View>
  );
};

export default RecipientPicker;
