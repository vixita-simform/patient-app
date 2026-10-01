import type { ReactElement } from "react";
import { View } from "react-native";

import { CustomText, StatusBadge } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import LabResultRowStyles from "./LabResultRowStyles";
import type { LabResultRowProps } from "./LabResultRowTypes";

/** Maps a result's status tone to its range-bar marker fill style key. */
const MARK_STYLE_KEY = Object.freeze({
  green: "markGreen",
  amber: "markAmber",
  coral: "markCoral",
} as const);

/**
 * One lab result row: name + status badge, value + unit / normal range, and
 * a range bar whose "normal" band and value marker are laid out with computed
 * percentages from `useLabReportDetailScreen`.
 * @param {LabResultRowProps} props - the result data and whether to render a top divider.
 * @returns {ReactElement} A React Element.
 */
const LabResultRow = ({ result, isDivided }: LabResultRowProps): ReactElement => {
  const { styles } = useTheme(LabResultRowStyles);

  return (
    <View style={[styles.result, isDivided && styles.resultDivider]}>
      <View style={styles.topRow}>
        <CustomText style={styles.tTitle}>{result.name}</CustomText>
        <StatusBadge label={result.statusLabel} tone={result.status} />
      </View>
      <View style={styles.valueRow}>
        <CustomText style={styles.resultValue}>
          {`${result.value.toLocaleString("en-IN")} `}
          <CustomText style={styles.tXs}>{result.unit}</CustomText>
        </CustomText>
        <CustomText style={styles.tXs}>
          {`${Strings.LabReportDetailScreen.normalRangePrefix}${result.normalMin} – ${result.normalMax}`}
        </CustomText>
      </View>
      <View style={styles.range}>
        <View style={styles.rangeOk} />
        <View
          style={[
            styles.rangeMark,
            styles[MARK_STYLE_KEY[result.status]],
            { left: `${result.markerPercent}%` },
          ]}
        />
      </View>
    </View>
  );
};

export default LabResultRow;
