import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { CloseIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import TagListStyles from "./TagListStyles";
import type { TagListProps } from "./TagListTypes";

/**
 * Wrapping row of removable soft tags followed by a dashed "add" chip.
 * @param {TagListProps} props - tags, labels and remove/add handlers.
 * @returns {ReactElement} A React Element.
 */
const TagList = ({
  tags,
  addLabel,
  removeLabel,
  onRemove,
  onAdd,
}: TagListProps): ReactElement => {
  const { styles, theme } = useTheme(TagListStyles);

  return (
    <View style={styles.chipsWrap}>
      {tags.map((tag) => (
        <View key={tag.id} style={styles.chipSoft}>
          <CustomText style={styles.chipText}>{tag.label}</CustomText>
          <Pressable
            accessibilityLabel={`${removeLabel} ${tag.label}`}
            accessibilityRole="button"
            onPress={() => onRemove(tag.id)}
          >
            <CloseIcon color={Colors[theme].green} size={scale(16)} />
          </Pressable>
        </View>
      ))}
      <Pressable
        accessibilityLabel={addLabel}
        accessibilityRole="button"
        style={styles.chipDashed}
        onPress={onAdd}
      >
        <CustomText style={styles.chipText}>{addLabel}</CustomText>
      </Pressable>
    </View>
  );
};

export default TagList;
