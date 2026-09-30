import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import QuickActionTileStyles from "./QuickActionTileStyles";
import type {
  QuickActionTileProps,
  QuickActionVariant,
} from "./QuickActionTileTypes";

const ICON_BOX_STYLE_KEY = Object.freeze({
  green: "iconBoxGreen",
  blue: "iconBoxBlue",
  amber: "iconBoxAmber",
  emergency: "iconBoxEmergency",
} as const satisfies Record<QuickActionVariant, string>);

const ICON_COLOR_KEY = Object.freeze({
  green: "green",
  blue: "blue",
  amber: "amberInk",
  emergency: "white",
} as const satisfies Record<QuickActionVariant, string>);

/**
 * Quick action tile with a tinted icon box and label; the emergency variant is solid coral.
 * @param {QuickActionTileProps} props - label, variant, icon and press handler.
 * @returns {ReactElement} A React Element.
 */
const QuickActionTile = ({
  label,
  variant,
  Icon,
  onPress,
}: QuickActionTileProps): ReactElement => {
  const { styles, theme } = useTheme(QuickActionTileStyles);
  const isEmergency = variant === "emergency";
  const iconColor = Colors[theme][ICON_COLOR_KEY[variant]];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={StyleSheet.flatten([
        styles.quickTile,
        isEmergency && styles.quickTileEmergency,
      ])}
      onPress={onPress}
    >
      <View
        style={StyleSheet.flatten([
          styles.iconBox,
          styles[ICON_BOX_STYLE_KEY[variant]],
        ])}
      >
        <Icon color={iconColor} size={scale(20)} />
      </View>
      <CustomText
        style={StyleSheet.flatten([
          styles.textTitle,
          isEmergency && styles.textTitleEmergency,
        ])}
      >
        {label}
      </CustomText>
    </Pressable>
  );
};

export default QuickActionTile;
