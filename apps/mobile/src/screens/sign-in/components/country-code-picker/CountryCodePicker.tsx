import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import type { ListRenderItem } from "react-native";

import { ChevronDownIcon, CheckIcon, CloseIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { Strings } from "../../../../constants";
import type { CountryCode } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import CountryCodePickerStyles from "./CountryCodePickerStyles";
import type { CountryCodePickerProps } from "./CountryCodePickerTypes";

const COPY = Strings.SignInScreen;

const keyExtractor = (item: CountryCode): string => item.code;

/**
 * Dial-code trigger (shown inside the phone field) plus the bottom-sheet country list it opens.
 * @param {CountryCodePickerProps} props - countries, current selection and select handler.
 * @returns {ReactElement} A React Element.
 */
const CountryCodePicker = ({
  countries,
  selected,
  onSelect,
}: CountryCodePickerProps): ReactElement => {
  const { styles, theme } = useTheme(CountryCodePickerStyles);
  const [isOpen, setIsOpen] = useState(false);

  // Latest `onSelect` kept in a ref so `renderItem` depends on values only.
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const selectedCode = selected.code;

  const renderItem: ListRenderItem<CountryCode> = useCallback(
    ({ item }) => {
      const isSelected = item.code === selectedCode;

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          style={isSelected ? StyleSheet.flatten([styles.row, styles.rowSelected]) : styles.row}
          onPress={() => {
            onSelectRef.current(item.code);
            setIsOpen(false);
          }}
        >
          <CustomText style={styles.flag}>{item.flag}</CustomText>
          <CustomText style={styles.countryName}>{item.name}</CustomText>
          <CustomText style={styles.rowDialCode}>{item.dialCode}</CustomText>
          {isSelected ? <CheckIcon color={Colors[theme].green} size={scale(20)} /> : null}
        </Pressable>
      );
    },
    [selectedCode, styles, theme],
  );

  return (
    <>
      <Pressable
        accessibilityLabel={COPY.changeCountryCode}
        accessibilityRole="button"
        hitSlop={scale(8)}
        style={styles.trigger}
        onPress={() => setIsOpen(true)}
      >
        <CustomText style={styles.dialCode}>{selected.dialCode}</CustomText>
        <ChevronDownIcon color={Colors[theme].muted} size={scale(16)} />
      </Pressable>
      <Modal
        transparent
        animationType="slide"
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.overlay}>
          {/* Backdrop is a sibling behind the sheet, so screen readers can still reach the rows. */}
          <Pressable
            accessibilityLabel={COPY.closeCountryPicker}
            accessibilityRole="button"
            style={styles.backdrop}
            onPress={() => setIsOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <CustomText style={styles.sheetTitle}>{COPY.selectCountry}</CustomText>
              <Pressable
                accessibilityLabel={COPY.closeCountryPicker}
                accessibilityRole="button"
                hitSlop={scale(8)}
                onPress={() => setIsOpen(false)}
              >
                <CloseIcon color={Colors[theme].muted} size={scale(20)} />
              </Pressable>
            </View>
            <FlatList
              contentContainerStyle={styles.listContent}
              data={countries}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CountryCodePicker;
