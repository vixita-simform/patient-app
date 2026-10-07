import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks';
import SegmentedTab from './SegmentedTab';
import SegmentedTabsStyles from './SegmentedTabsStyles';
import type { SegmentedTabsProps } from './SegmentedTabsTypes';

/**
 * Segmented tab control (pill track with a raised active segment).
 * @param {SegmentedTabsProps<T>} props - tab items, active id and press handler.
 * @returns {ReactElement} A React Element.
 */
const SegmentedTabs = <T extends string>({
  items,
  activeId,
  onPress
}: SegmentedTabsProps<T>): ReactElement => {
  const { styles } = useTheme(SegmentedTabsStyles);

  const activeItemStyle = useMemo(
    () => StyleSheet.flatten([styles.tabItem, styles.tabItemActive]),
    [styles]
  );
  const activeTextStyle = useMemo(
    () => StyleSheet.flatten([styles.tabText, styles.tabTextActive]),
    [styles]
  );

  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <SegmentedTab
            id={item.id}
            isActive={isActive}
            key={item.id}
            label={item.label}
            style={isActive ? activeItemStyle : styles.tabItem}
            textStyle={isActive ? activeTextStyle : styles.tabText}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

export default SegmentedTabs;
