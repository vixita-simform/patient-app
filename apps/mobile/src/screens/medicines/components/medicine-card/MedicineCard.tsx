import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { PillIcon } from "../../../../assets/icons";
import { CustomButton, CustomText, IconBox, StatusBadge } from "../../../../components";
import { BUTTON_VARIANT, MEDICINE_TINT, Strings, type MedicineTint } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import MedicineCardStyles from "./MedicineCardStyles";
import type { MedicineCardProps } from "./MedicineCardTypes";

/** Maps a medicine's tint key to its stock-fill style key. */
const FILL_STYLE_KEY = Object.freeze({
  [MEDICINE_TINT.green]: "stockFillGreen",
  [MEDICINE_TINT.blue]: "stockFillBlue",
  [MEDICINE_TINT.coral]: "stockFillCoral",
} as const satisfies Record<MedicineTint, string>);

/**
 * One medicine card: tinted pill icon, name + status badge, dosage line and
 * a stock progress bar. The lowest-stock card also shows an outline
 * "Order refill" button, disabled while no refill handler is passed.
 * @param {MedicineCardProps} props - the medicine entry and optional refill handler.
 * @returns {ReactElement} A React Element.
 */
const MedicineCard = ({
  medicine,
  onOrderRefillPress,
}: MedicineCardProps): ReactElement => {
  const { styles } = useTheme(MedicineCardStyles);
  const fillKey = FILL_STYLE_KEY[medicine.tintKey];
  const stockFraction =
    medicine.stockTotal > 0 ? medicine.stockRemaining / medicine.stockTotal : 0;
  // One clamped percent drives both the fill width and the progressbar value.
  const stockPercent = Math.round(Math.min(Math.max(stockFraction, 0), 1) * 100);
  // Width is data-driven, so it cannot live in the static stylesheet.
  const fillStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.stockFill,
        styles[fillKey],
        { width: `${stockPercent}%` as const },
      ]),
    [styles, fillKey, stockPercent],
  );
  const stockOfLabel = `${medicine.stockRemaining} ${Strings.Common.of} ${medicine.stockTotal}`;

  return (
    <View style={styles.card}>
      <View style={styles.med}>
        <IconBox Icon={PillIcon} tone={medicine.tintKey} />
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
          accessibilityLabel={Strings.MedicinesScreen.stockLeft}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: stockPercent }}
          style={styles.stockTrack}
        >
          <View style={fillStyle} />
        </View>
      </View>
      {medicine.showRefillButton ? (
        <CustomButton
          disabled={!onOrderRefillPress}
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
