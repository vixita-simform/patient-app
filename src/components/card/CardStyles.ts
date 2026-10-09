import { StyleSheet } from "react-native";

import { Colors, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors[theme].card,
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: Colors[theme].border,
      padding: scale(14),
    },
    pressed: {
      opacity: 0.7,
    },
  });

export default styles;
