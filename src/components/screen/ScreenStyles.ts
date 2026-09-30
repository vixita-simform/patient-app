import { StyleSheet } from "react-native";

import { Colors, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
  });

export default styles;
