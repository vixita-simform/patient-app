import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { PillIcon } from "../../../../assets/icons";
import { CustomButton, CustomText, StatusBadge } from "../../../../components";
import { BUTTON_VARIANT, Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import MedicineCardStyles from "./MedicineCardStyles";
import type { MedicineCardProps } from "./MedicineCardTypes";

/** Maps a medicine's tint key to its icon-box and stock-fill style keys. */
const TINT_STYLE_KEY = Object.freeze({
  green: { iconBox: "iconBoxGreen", fill: "stockFillGreen", icon: "green" },
  blue: { iconBox: "iconBoxBlue", fill: "stockFillBlue", icon: "blue" },
  coral: { iconBox: "iconBoxCoral", fill: "stockFillCoral", icon: "coral" },
} as const);

/**
 * One medicine card: tinted pill icon, name + status badge, dosage line and
 * a stock progress bar. The lowest-stock card also shows an outline
 * "Order refill" button.
 * @param {MedicineCardProps} props - the medicine entry and refill handler.
 * @returns {ReactElement} A React Element.
 */
const MedicineCard = ({
  medicine,
  onOrderRefillPress,
}: MedicineCardProps): ReactElement => {
  const { styles, theme } = useTheme(MedicineCardStyles);
  const tintKey = TINT_STYLE_KEY[medicine.tintKey];
  const iconColor = Colors[theme][tintKey.icon];
  const stockFraction =
    medicine.stockTotal > 0 ? medicine.stockRemaining / medicine.stockTotal : 0;
  // Width is data-driven, so it cannot live in the static stylesheet.
  const fillStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.stockFill,
        styles[tintKey.fill],
        {
          width:
            `${Math.round(Math.min(Math.max(stockFraction, 0), 1) * 100)}%` as const,
        },
      ]),
    [styles, tintKey.fill, stockFraction],
  );
  const stockOfLabel = `${medicine.stockRemaining} of ${medicine.stockTotal}`;

  return (
    <View style={styles.card}>
      <View style={styles.med}>
        <View style={[styles.iconBox, styles[tintKey.iconBox]]}>
          <PillIcon color={iconColor} size={scale(20)} />
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <CustomText style={styles.name}>{medicine.name}</CustomText>
            <StatusBadge
              label={medicine.statusLabel}
              tone={medicine.statusTone}
            />
          </View>
          <CustomText style={styles.dosage}>{medicine.dosage}</CustomText>
        </View>
      </View>
      <View style={styles.stockBlock}>
        <View style={styles.row}>
          <CustomText style={styles.stockLabel}>
            {Strings.MedicinesScreen.stockLeft}
          </CustomText>
          <CustomText style={styles.stockLabel}>{stockOfLabel}</CustomText>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(stockFraction * 100),
          }}
          style={styles.stockTrack}
        >
          <View style={fillStyle} />
        </View>
      </View>
      {medicine.showRefillButton ? (
        <CustomButton
          label={Strings.MedicinesScreen.orderRefill}
          style={styles.refillButton}
          textStyle={styles.orderRefillText}
          variant={BUTTON_VARIANT.line}
          onPress={onOrderRefillPress}
        />
      ) : null}
    </View>
  );
};

export default MedicineCard;
