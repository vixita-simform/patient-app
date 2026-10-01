import type { ReactElement } from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { CustomText, StatusBadge } from "../../../../components";
import { STATUS_BADGE_TONE, Strings, type StatusBadgeTone } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { formatNumber } from "../../../../utils";
import LabResultRowStyles from "./LabResultRowStyles";
import type { LabResultRowProps } from "./LabResultRowTypes";

/** Maps a result's status tone to its range-bar marker fill style key. */
const MARK_STYLE_KEY = Object.freeze({
  [STATUS_BADGE_TONE.green]: "markGreen",
  [STATUS_BADGE_TONE.amber]: "markAmber",
  [STATUS_BADGE_TONE.coral]: "markCoral",
} as const satisfies Record<StatusBadgeTone, string>);

/**
 * One lab result row: name + status badge, value + unit / normal range, and
 * a range bar whose "normal" band and value marker are laid out with computed
 * percentages from `useLabReportDetailScreen`.
 * @param {LabResultRowProps} props - the result data and whether to render a top divider.
 * @returns {ReactElement} A React Element.
 */
const LabResultRow = ({ result, isDivided }: LabResultRowProps): ReactElement => {
  const { styles } = useTheme(LabResultRowStyles);
  // Left offset is data-driven, so it cannot live in the static stylesheet.
  const markStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.rangeMark,
        styles[MARK_STYLE_KEY[result.status]],
        { left: `${result.markerPercent}%` as const },
      ]),
    [styles, result.status, result.markerPercent],
  );

  return (
    <View style={StyleSheet.flatten([styles.result, isDivided && styles.resultDivider])}>
      <View style={styles.topRow}>
        <CustomText style={styles.tTitle}>{result.name}</CustomText>
        <StatusBadge label={result.statusLabel} tone={result.status} />
      </View>
      <View style={styles.valueRow}>
        <CustomText style={styles.resultValue}>
          {`${formatNumber(result.value)} `}
          <CustomText style={styles.tXs}>{result.unit}</CustomText>
        </CustomText>
        <CustomText style={styles.tXs}>
          {`${Strings.LabReportDetailScreen.normalRangePrefix} ${result.normalMin}${Strings.Common.rangeSeparator}${result.normalMax}`}
        </CustomText>
      </View>
      <View style={styles.range}>
        <View style={styles.rangeRail}>
          <View style={styles.rangeOk} />
          <View style={markStyle} />
        </View>
      </View>
    </View>
  );
};

export default LabResultRow;
