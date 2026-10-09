import type { ReactElement } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { BackIcon } from "../../assets/icons";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { scale, theme } from "../../theme";
import { CustomText } from "../custom-text";
import SubScreenStyles from "./SubScreenStyles";
import type { SubScreenProps } from "./SubScreenTypes";

const BACK_ICON_SIZE = scale(18);
const BACK_HIT_SLOP = scale(12);

/**
 * Scrollable sub-screen shell with a back button, title and subtitle.
 * @param {SubScreenProps} props - title, subtitle, back handler and content.
 * @returns {ReactElement} A React Element.
 */
const SubScreen = ({
  title,
  subtitle,
  onBack,
  children,
}: SubScreenProps): ReactElement => {
  const { styles } = useTheme(SubScreenStyles);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={Strings.Common.back}
          accessibilityRole="button"
          hitSlop={BACK_HIT_SLOP}
          onPress={onBack}
        >
          <BackIcon color={theme.colors.text} size={BACK_ICON_SIZE} />
        </Pressable>
        <View>
          <CustomText style={styles.title}>{title}</CustomText>
          <CustomText style={styles.subtitle}>{subtitle}</CustomText>
        </View>
      </View>
      {children}
    </ScrollView>
  );
};

export default SubScreen;
