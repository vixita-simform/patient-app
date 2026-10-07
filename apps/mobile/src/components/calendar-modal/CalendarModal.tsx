import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { type ReactElement, useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { CustomText } from '../custom-text';
import { Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { scale } from '../../theme';
import CalendarModalStyles from './CalendarModalStyles';
import type { CalendarModalProps } from './CalendarModalTypes';

/** Grows the text-sized Cancel / Done targets to at least 44pt. */
const HEADER_HIT_SLOP = scale(12);

/**
 * iOS date picker rendered as a dismissible bottom-sheet modal. The picked date is held
 * locally: Done commits it through `onConfirm`, Cancel / backdrop discard it. Android opens
 * its own native imperative dialog instead and never renders this component.
 * @param {CalendarModalProps} props - visibility, selected/min/max date and handlers.
 * @returns {ReactElement} A React Element.
 */
const CalendarModal = ({
  visible,
  selectedDate,
  minimumDate,
  maximumDate,
  onConfirm,
  onDismiss
}: CalendarModalProps): ReactElement => {
  const { styles } = useTheme(CalendarModalStyles);
  const [pendingDate, setPendingDate] = useState(selectedDate);
  const [syncedVisible, setSyncedVisible] = useState(visible);
  const [syncedDate, setSyncedDate] = useState(selectedDate);

  // Each time the sheet opens (or the applied date changes while open), start from the
  // currently applied date. Adjusted during render rather than in an effect to avoid a
  // second render pass: https://react.dev/learn/you-might-not-need-an-effect
  if (visible !== syncedVisible || selectedDate !== syncedDate) {
    setSyncedVisible(visible);
    setSyncedDate(selectedDate);
    if (visible) {
      setPendingDate(selectedDate);
    }
  }

  const onChange = useCallback((_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setPendingDate(date);
    }
  }, []);

  const onDonePress = useCallback(() => {
    onConfirm(pendingDate);
  }, [onConfirm, pendingDate]);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        {/* Sibling of the sheet, not its parent, so screen readers can reach the sheet's controls. */}
        <Pressable
          accessibilityLabel={Strings.Common.cancel}
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel={Strings.Common.cancel}
              accessibilityRole="button"
              hitSlop={HEADER_HIT_SLOP}
              onPress={onDismiss}
            >
              <CustomText style={styles.headerText}>{Strings.Common.cancel}</CustomText>
            </Pressable>
            <Pressable
              accessibilityLabel={Strings.Common.done}
              accessibilityRole="button"
              hitSlop={HEADER_HIT_SLOP}
              onPress={onDonePress}
            >
              <CustomText style={styles.headerText}>{Strings.Common.done}</CustomText>
            </Pressable>
          </View>
          <View style={styles.body}>
            <DateTimePicker
              display="inline"
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              mode="date"
              value={pendingDate}
              onChange={onChange}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarModal;
