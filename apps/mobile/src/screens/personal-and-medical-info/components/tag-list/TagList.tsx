import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CustomText } from '../../../../components';
import { useTheme } from '../../../../hooks';
import Tag from './Tag';
import TagListStyles from './TagListStyles';
import type { TagListProps } from './TagListTypes';

/**
 * Wrapping row of removable soft tags followed by a dashed "add" chip.
 * @param {TagListProps} props - tags, labels and remove/add handlers.
 * @returns {ReactElement} A React Element.
 */
const TagList = ({ tags, addLabel, removeLabel, onRemove, onAdd }: TagListProps): ReactElement => {
  const { styles } = useTheme(TagListStyles);
  const isAddDisabled = !onAdd;
  const addStyle = useMemo(
    () =>
      isAddDisabled
        ? StyleSheet.flatten([styles.chipDashed, styles.chipDisabled])
        : styles.chipDashed,
    [styles, isAddDisabled]
  );
  const addAccessibilityState = useMemo(() => ({ disabled: isAddDisabled }), [isAddDisabled]);

  return (
    <View style={styles.chipsWrap}>
      {tags.map((tag) => (
        <Tag
          id={tag.id}
          key={tag.id}
          label={tag.label}
          removeLabel={removeLabel}
          onRemove={onRemove}
        />
      ))}
      <Pressable
        accessibilityLabel={addLabel}
        accessibilityRole="button"
        accessibilityState={addAccessibilityState}
        disabled={isAddDisabled}
        style={addStyle}
        onPress={onAdd}
      >
        <CustomText style={styles.chipText}>{addLabel}</CustomText>
      </Pressable>
    </View>
  );
};

export default TagList;
