import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

// design-drift[width]: spec's `calc(33.33% - 7px)` has no RN equivalent (percentage
// widths can't subtract a fixed gap); '31%' + the row's `gap: scale(10)` reproduces
// the 3-column wrap visually without a guessed container-width constant.
const SLOT_WIDTH_PERCENT = "31%";

/**
 * Styles for a single time-slot chip (available / selected / taken).
 * @param {ThemeMode} theme - active theme mode.
 * @returns style sheet for `TimeSlotChip`.
 */
const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    slot: {
      width: SLOT_WIDTH_PERCENT,
      height: scale(44),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(12),
    },
    slotActive: {
      backgroundColor: Colors[theme].navy,
      borderColor: Colors[theme].navy,
    },
    // design-drift[text-decoration]: RN Text has no strikethrough token; textDecorationLine covers the taken state visually
    slotTaken: {
      backgroundColor: Colors[theme].line,
      borderColor: Colors[theme].line,
    },
    slotPast: {
      backgroundColor: Colors[theme].line,
      borderColor: Colors[theme].line,
      opacity: 0.6,
    },
    slotLabel: {
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].navy,
    },
    slotActiveLabel: {
      color: Colors[theme].white,
    },
    slotTakenLabel: {
      color: Colors[theme].tabInactive,
      textDecorationLine: "line-through",
    },
    slotPastLabel: {
      color: Colors[theme].tabInactive,
    },
  });

export default styles;
