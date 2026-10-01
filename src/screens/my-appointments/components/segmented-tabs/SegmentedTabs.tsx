import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import SegmentedTabsStyles from "./SegmentedTabsStyles";
import type { SegmentedTabsProps } from "./SegmentedTabsTypes";

/**
 * 3-segment tab control (Upcoming / Completed / Cancelled).
 * @param {SegmentedTabsProps} props - tab items, active id and press handler.
 * @returns {ReactElement} A React Element.
 */
const SegmentedTabs = ({ items, activeId, onPress }: SegmentedTabsProps): ReactElement => {
  const { styles } = useTheme(SegmentedTabsStyles);

  return (
    <View style={styles.tabs}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={item.id}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onPress(item.id)}
          >
            <CustomText style={[styles.tabText, isActive && styles.tabTextActive]}>
              {item.label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedTabs;
