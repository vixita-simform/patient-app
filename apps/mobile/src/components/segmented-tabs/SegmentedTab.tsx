import type { ReactElement } from 'react';
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { CustomText } from '../custom-text';

// Shared, frozen a11y states so each render reuses the same objects.
const SELECTED_STATE = Object.freeze({ selected: true });
const UNSELECTED_STATE = Object.freeze({ selected: false });

interface SegmentedTabProps<T extends string> {
  id: T;
  label: string;
  isActive: boolean;
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
  onPress: (id: T) => void;
}

/**
 * One segment of `SegmentedTabs`; passes its id back on press.
 * @param {SegmentedTabProps<T>} props - id, label, active flag, styles and press handler.
 * @returns {ReactElement} A React Element.
 */
const SegmentedTab = <T extends string>({
  id,
  label,
  isActive,
  style,
  textStyle,
  onPress
}: SegmentedTabProps<T>): ReactElement => {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={isActive ? SELECTED_STATE : UNSELECTED_STATE}
      style={style}
      onPress={handlePress}
    >
      <CustomText style={textStyle}>{label}</CustomText>
    </Pressable>
  );
};

export default memo(SegmentedTab) as typeof SegmentedTab;
