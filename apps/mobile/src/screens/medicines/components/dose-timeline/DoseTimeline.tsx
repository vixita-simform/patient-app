import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { CheckIcon, ClockIcon } from "../../../../assets/icons";
import { CustomText } from "../../../../components";
import { DOSE_STATUS } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import DoseTimelineStyles from "./DoseTimelineStyles";
import type { DoseTimelineProps } from "./DoseTimelineTypes";

/** Maps a dose status to its chip/text style keys. */
const DOSE_STYLE_KEY = Object.freeze({
  [DOSE_STATUS.done]: { chip: "doseDone", text: "doseTimeDone" },
  [DOSE_STATUS.next]: { chip: "doseNext", text: "doseTimeNext" },
  [DOSE_STATUS.pending]: { chip: undefined, text: undefined },
} as const);

/**
 * "Today's doses" strip: one chip per dose, showing a check icon for taken
 * doses and a clock icon for the next/pending ones.
 * @param {DoseTimelineProps} props - the day's dose entries.
 * @returns {ReactElement} A React Element.
 */
const DoseTimeline = ({ doses }: DoseTimelineProps): ReactElement => {
  const { styles, theme } = useTheme(DoseTimelineStyles);

  return (
    <View style={styles.doseStrip}>
      {doses.map((dose) => {
        const styleKey = DOSE_STYLE_KEY[dose.status];
        const isDone = dose.status === DOSE_STATUS.done;
        const isNext = dose.status === DOSE_STATUS.next;
        const iconColor = isDone
          ? Colors[theme].green
          : isNext
            ? Colors[theme].white
            : Colors[theme].navy;

        return (
          <View
            accessible
            accessibilityLabel={dose.accessibilityLabel}
            key={dose.id}
            style={StyleSheet.flatten([
              styles.dose,
              styleKey.chip ? styles[styleKey.chip] : undefined,
            ])}
          >
            {isDone ? (
              <CheckIcon color={iconColor} size={scale(16)} />
            ) : (
              <ClockIcon color={iconColor} size={scale(16)} />
            )}
            <CustomText
              style={StyleSheet.flatten([
                styles.doseTime,
                styleKey.text ? styles[styleKey.text] : undefined,
              ])}
            >
              {dose.timeLabel}
            </CustomText>
          </View>
        );
      })}
    </View>
  );
};

export default DoseTimeline;
