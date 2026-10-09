import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    container: { paddingVertical: scale(8) },
    row: { flexDirection: "row", gap: scale(7), alignItems: "center" },
    attachButton: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    attachButtonActive: { borderColor: Colors[theme].primary },
    input: {
      flex: 1,
      paddingVertical: scale(8),
      paddingHorizontal: scale(12),
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      backgroundColor: Colors[theme].card,
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f12,
      color: Colors[theme].text,
    },
    sendButton: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: Colors[theme].primary,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  });

export default styles;
