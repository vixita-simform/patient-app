import { StyleSheet } from "react-native";

import { Colors, scale, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    iconBox: {
      width: scale(44),
      height: scale(44),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: scale(14),
    },
    iconBoxGreen: {
      backgroundColor: Colors[theme].greenSoft,
    },
    iconBoxBlue: {
      backgroundColor: Colors[theme].blueSoft,
    },
    iconBoxAmber: {
      backgroundColor: Colors[theme].amberSoft,
    },
    iconBoxCoral: {
      backgroundColor: Colors[theme].coralSoft,
    },
  });

export default styles;
