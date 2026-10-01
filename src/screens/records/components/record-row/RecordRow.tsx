import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { ChevronRightIcon } from "../../../../assets/icons";
import { CustomText, StatusBadge } from "../../../../components";
import { RECORD_TYPE } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import { RECORD_TYPE_META } from "../../RecordsScreenTypes";
import RecordRowStyles from "./RecordRowStyles";
import type { RecordRowProps } from "./RecordRowTypes";

/** Maps a record type to its icon-box tint style key. */
const ICON_BOX_STYLE_KEY = Object.freeze({
  [RECORD_TYPE.labReport]: "iconBoxBlue",
  [RECORD_TYPE.scan]: "iconBoxGreen",
  [RECORD_TYPE.prescription]: "iconBoxAmber",
  [RECORD_TYPE.discharge]: "iconBoxCoral",
} as const);

/**
 * One record row: tinted icon box, title/subtitle, and a trailing status
 * badge or chevron depending on the record's `trailing` data.
 * @param {RecordRowProps} props - the record to render.
 * @returns {ReactElement} A React Element.
 */
const RecordRow = ({ record, onPress }: RecordRowProps): ReactElement => {
  const { styles, theme } = useTheme(RecordRowStyles);
  const { Icon } = RECORD_TYPE_META[record.type];
  const iconColor = Colors[theme][RECORD_TYPE_META[record.type].iconColorKey];
  // Only lab-report rows have a target screen today.
  const isPressable =
    record.type === RECORD_TYPE.labReport && record.pressable !== false && Boolean(onPress);
  const recordId = record.id;

  const handlePress = useCallback(() => {
    onPress?.(recordId);
  }, [recordId, onPress]);

  const content = (
    <>
      <View style={[styles.iconBox, styles[ICON_BOX_STYLE_KEY[record.type]]]}>
        <Icon color={iconColor} size={scale(20)} />
      </View>
      <View style={styles.info}>
        <CustomText style={styles.title}>{record.title}</CustomText>
        <CustomText style={styles.subtitle}>{record.subtitle}</CustomText>
      </View>
      {record.trailing.kind === "badge" ? (
        <StatusBadge
          label={record.trailing.label}
          tone={record.trailing.tone}
        />
      ) : (
        <ChevronRightIcon color={Colors[theme].muted} size={scale(20)} />
      )}
    </>
  );

  if (isPressable) {
    return (
      <Pressable
        accessibilityRole="button"
        style={styles.record}
        onPress={handlePress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.record}>{content}</View>;
};

export default RecordRow;
