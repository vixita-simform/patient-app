import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { ChevronRightIcon } from '../../../../assets/icons';
import { CustomText, IconBox, StatusBadge } from '../../../../components';
import { RECORD_TRAILING_KIND } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import { RECORD_TYPE_META } from './RecordRowConstants';
import RecordRowStyles from './RecordRowStyles';
import type { RecordRowProps } from './RecordRowTypes';

/**
 * One record row: tinted icon box, title/subtitle, and a trailing status badge, or a
 * chevron when the row opens a detail screen.
 * @param {RecordRowProps} props - the record to render and its press handler.
 * @returns {ReactElement} A React Element.
 */
const RecordRow = ({ record, onPress }: RecordRowProps): ReactElement => {
  const { styles, theme } = useTheme(RecordRowStyles);
  const { Icon, tone } = RECORD_TYPE_META[record.type];
  const isPressable = record.pressable && Boolean(onPress);
  const handlePress = useCallback(() => onPress?.(record.id), [record.id, onPress]);

  let trailing: ReactElement | null = null;
  if (record.trailing.kind === RECORD_TRAILING_KIND.badge) {
    trailing = <StatusBadge label={record.trailing.label} tone={record.trailing.tone} />;
  } else if (isPressable) {
    // A chevron promises navigation, so it is only shown on rows that navigate.
    trailing = <ChevronRightIcon color={Colors[theme].muted} size={scale(20)} />;
  }

  const content = (
    <>
      <IconBox Icon={Icon} tone={tone} />
      <View style={styles.info}>
        <CustomText style={styles.title}>{record.title}</CustomText>
        <CustomText style={styles.subtitle}>{record.subtitle}</CustomText>
      </View>
      {trailing}
    </>
  );

  if (isPressable) {
    return (
      <Pressable
        accessibilityLabel={record.title}
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
