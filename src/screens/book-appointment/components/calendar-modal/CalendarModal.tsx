import DateTimePicker from "@react-native-community/datetimepicker";
import type { ReactElement } from "react";
import { Modal, Pressable, View } from "react-native";

import { CustomText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import CalendarModalStyles from "./CalendarModalStyles";
import type { CalendarModalProps } from "./CalendarModalTypes";

/**
 * iOS date picker rendered as a dismissible bottom-sheet modal, with Cancel / Done
 * actions and a tap-outside-to-dismiss backdrop. Android opens its own native
 * imperative dialog instead and never renders this component.
 * @param {CalendarModalProps} props - visibility, selected/minimum date and handlers.
 * @returns {ReactElement} A React Element.
 */
const CalendarModal = ({ visible, selectedDate, minimumDate, onChange, onDismiss }: CalendarModalProps): ReactElement => {
  const { styles } = useTheme(CalendarModalStyles);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <Pressable
        accessibilityLabel={Strings.Common.cancel}
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onDismiss}
      >
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={onDismiss}>
              <CustomText style={styles.headerText}>{Strings.Common.cancel}</CustomText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onDismiss}>
              <CustomText style={styles.headerText}>{Strings.Common.done}</CustomText>
            </Pressable>
          </View>
          <View style={styles.body}>
            <DateTimePicker
              display="inline"
              minimumDate={minimumDate}
              mode="date"
              value={selectedDate}
              onChange={onChange}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CalendarModal;
