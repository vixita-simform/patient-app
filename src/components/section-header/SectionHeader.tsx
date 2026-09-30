import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { useTheme } from "../../hooks";
import { scale } from "../../theme";
import { CustomText } from "../custom-text";
import SectionHeaderStyles from "./SectionHeaderStyles";
import type { SectionHeaderProps } from "./SectionHeaderTypes";

/** Enlarges the small text link's touch target. */
const HIT_SLOP = scale(8);

/**
 * Section heading with an optional trailing text link.
 * @param {SectionHeaderProps} props - title, link label and press handler.
 * @returns {ReactElement} A React Element.
 */
const SectionHeader = ({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps): ReactElement => {
  const { styles } = useTheme(SectionHeaderStyles);

  return (
    <View style={styles.sectionTitle}>
      <CustomText style={styles.sectionTitleText}>{title}</CustomText>
      {actionLabel && onActionPress ? (
        <Pressable accessibilityRole="link" hitSlop={HIT_SLOP} onPress={onActionPress}>
          <CustomText style={styles.sectionTitleLink}>{actionLabel}</CustomText>
        </Pressable>
      ) : null}
    </View>
  );
};

export default SectionHeader;
