import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    tabs: {
      flexDirection: "row",
      backgroundColor: Colors[theme].segmentTrack,
      padding: scale(4),
      borderRadius: scale(14),
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      paddingHorizontal: 0,
      borderRadius: scale(11),
    },
    tabItemActive: {
      backgroundColor: Colors[theme].card,
      // design-drift[box-shadow]: CSS box-shadow -> RN shadow* + elevation
      shadowColor: Colors[theme].navyAlpha40,
      shadowOffset: { width: 0, height: scale(1) },
      shadowOpacity: 0.12,
      shadowRadius: scale(3),
      elevation: 2,
    },
    tabText: {
      textAlign: "center",
      fontFamily: Fonts.family.semiBold,
      fontSize: Fonts.size.f14,
      fontWeight: Fonts.weight.semi,
      color: Colors[theme].muted,
    },
    tabTextActive: {
      color: Colors[theme].navy,
    },
  });

export default styles;
