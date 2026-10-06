import { StyleSheet } from "react-native";

import { Colors, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    iconBtn: {
      width: scale(40),
      height: scale(40),
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(12),
    },
    iconBtnFill: {
      backgroundColor: Colors[theme].green,
      borderColor: Colors[theme].green,
    },
    pressed: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
    },
  });

export default styles;
