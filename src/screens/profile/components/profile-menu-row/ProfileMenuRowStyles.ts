import { StyleSheet } from "react-native";

import { Colors, Fonts, scale, type ThemeMode } from "../../../../theme";

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      paddingVertical: scale(12),
      paddingHorizontal: 0,
    },
    menuItemDivider: {
      borderTopWidth: scale(1),
      borderTopColor: Colors[theme].line,
    },
    pressed: {
      opacity: 0.7,
    },
    iconBox: {
      width: scale(44),
      height: scale(44),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: scale(14),
    },
    ibGreen: {
      backgroundColor: Colors[theme].greenSoft,
    },
    ibBlue: {
      backgroundColor: Colors[theme].blueSoft,
    },
    ibAmber: {
      backgroundColor: Colors[theme].amberSoft,
    },
    tTitle: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.h3,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].navy,
    },
    badge: {
      paddingVertical: scale(4),
      paddingHorizontal: scale(10),
      borderRadius: scale(10),
      backgroundColor: Colors[theme].greyBadge,
    },
    badgeText: {
      fontFamily: Fonts.family.bold,
      fontSize: Fonts.size.f12,
      fontWeight: Fonts.weight.extraSemi,
      color: Colors[theme].muted,
    },
  });

export default styles;
