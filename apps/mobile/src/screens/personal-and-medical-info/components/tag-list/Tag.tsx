import type { ReactElement } from "react";
import { memo, useCallback } from "react";
import { Pressable, View } from "react-native";

import { CloseIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import TagListStyles from "./TagListStyles";

/** Grows the 16px remove icon to the 44pt minimum touch target. */
const REMOVE_HIT_SLOP = scale(14);

interface TagProps {
  id: string;
  label: string;
  removeLabel: string;
  onRemove: (id: string) => void;
}

/**
 * One removable soft tag.
 * @param {TagProps} props - id, label, remove a11y prefix and remove handler.
 * @returns {ReactElement} A React Element.
 */
const Tag = ({ id, label, removeLabel, onRemove }: TagProps): ReactElement => {
  const { styles, theme } = useTheme(TagListStyles);
  const handleRemove = useCallback(() => onRemove(id), [id, onRemove]);

  return (
    <View style={styles.chipSoft}>
      <CustomText style={styles.chipText}>{label}</CustomText>
      <Pressable
        accessibilityLabel={`${removeLabel} ${label}`}
        accessibilityRole="button"
        hitSlop={REMOVE_HIT_SLOP}
        onPress={handleRemove}
      >
        <CloseIcon color={Colors[theme].green} size={scale(16)} />
      </Pressable>
    </View>
  );
};

export default memo(Tag);
