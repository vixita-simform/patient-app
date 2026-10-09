import { StyleSheet } from "react-native";

import { Colors, Fonts, type ThemeMode } from "../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    // width / height / borderRadius come from the `size` prop at render time.
    avatar: {
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    initials: {
      fontFamily: Fonts.family.bold,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].white,
    },
  });

export default styles;
