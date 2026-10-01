import type { ReactElement } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import SegmentedTabsStyles from "./SegmentedTabsStyles";
import type { SegmentedTabsProps } from "./SegmentedTabsTypes";

// Shared, frozen a11y states so each render reuses the same objects.
const SELECTED_STATE = Object.freeze({ selected: true });
const UNSELECTED_STATE = Object.freeze({ selected: false });

/**
 * Segmented tab control (pill track with a raised active segment).
 * @param {SegmentedTabsProps<T>} props - tab items, active id and press handler.
 * @returns {ReactElement} A React Element.
 */
const SegmentedTabs = <T extends string>({ items, activeId, onPress }: SegmentedTabsProps<T>): ReactElement => {
  const { styles } = useTheme(SegmentedTabsStyles);

  const activeItemStyle = useMemo(
    () => StyleSheet.flatten([styles.tabItem, styles.tabItemActive]),
    [styles],
  );
  const activeTextStyle = useMemo(
    () => StyleSheet.flatten([styles.tabText, styles.tabTextActive]),
    [styles],
  );

  return (
    <View style={styles.tabs}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={isActive ? SELECTED_STATE : UNSELECTED_STATE}
            key={item.id}
            style={isActive ? activeItemStyle : styles.tabItem}
            onPress={() => onPress(item.id)}
          >
            <CustomText style={isActive ? activeTextStyle : styles.tabText}>
              {item.label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedTabs;
