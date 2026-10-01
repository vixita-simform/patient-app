import type { ReactElement } from "react";
import { View } from "react-native";

import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import StatusBadgeStyles from "./StatusBadgeStyles";
import type { StatusBadgeProps } from "./StatusBadgeTypes";

/** Maps a tone to its background/text style keys. */
const TONE_STYLE_KEY = Object.freeze({
  green: { container: "badgeGreen", text: "badgeGreenText" },
  amber: { container: "badgeAmber", text: "badgeAmberText" },
  coral: { container: "badgeCoral", text: "badgeCoralText" },
} as const);

/**
 * Small pill badge (green or amber tone).
 * @param {StatusBadgeProps} props - badge label and tone.
 * @returns {ReactElement} A React Element.
 */
const StatusBadge = ({ label, tone = "green" }: StatusBadgeProps): ReactElement => {
  const { styles } = useTheme(StatusBadgeStyles);
  const toneKey = TONE_STYLE_KEY[tone];

  return (
    <View style={[styles.badge, styles[toneKey.container]]}>
      <CustomText style={[styles.badgeText, styles[toneKey.text]]}>{label}</CustomText>
    </View>
  );
};

export default StatusBadge;
