import { StyleSheet } from "react-native";

import { Colors, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    avatarEdit: {
      position: "relative",
      alignSelf: "center",
    },
    avatarPen: {
      position: "absolute",
      right: scale(-2),
      bottom: scale(-2),
      width: scale(32),
      height: scale(32),
      backgroundColor: Colors[theme].navy,
      borderWidth: scale(3),
      borderColor: Colors[theme].background,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(16),
    },
    avatarPenDisabled: {
      opacity: 0.5,
    },
  });

export default styles;
