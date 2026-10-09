import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "../components";
import { useTheme } from "../hooks";
import type { TabBarLabelProps } from "./TabBarLabelTypes";
import TabBarStyles, { TAB_LABEL_MAX_FONT_SIZE_MULTIPLIER } from "./TabBarStyles";

/**
 * Tab label: bold when active, medium otherwise, with a dot under the active tab.
 * @param {TabBarLabelProps} props - focus state, tint color and label text from the tab navigator.
 * @returns {ReactElement} A React Element.
 */
export default function TabBarLabel({
  focused,
  color,
  children,
}: TabBarLabelProps): ReactElement {
  const { styles } = useTheme(TabBarStyles);
  const labelStyle = useMemo(
    () =>
      StyleSheet.flatten([styles.tabBarLabel, focused && styles.tabBarLabelActive, { color }]),
    [styles.tabBarLabel, styles.tabBarLabelActive, focused, color],
  );

  return (
    <View style={styles.tabBarLabelWrap}>
      <AppText
        maxFontSizeMultiplier={TAB_LABEL_MAX_FONT_SIZE_MULTIPLIER}
        numberOfLines={1}
        style={labelStyle}
      >
        {children}
      </AppText>
      {focused && <View style={styles.tabBarDot} />}
    </View>
  );
}

/**
 * Render callback for the `tabBarLabel` screen option.
 * @param {TabBarLabelProps} props - focus state, tint color and label text from the tab navigator.
 * @returns {ReactElement} A React Element.
 */
export const renderTabBarLabel = (props: TabBarLabelProps): ReactElement => (
  <TabBarLabel {...props} />
);
