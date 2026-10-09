import { StyleSheet } from "react-native";

import { Colors, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    circle: {
      backgroundColor: Colors[theme].successSoft,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    circleMuted: {
      backgroundColor: Colors[theme].mutedSoft,
    },
  });

export default styles;
