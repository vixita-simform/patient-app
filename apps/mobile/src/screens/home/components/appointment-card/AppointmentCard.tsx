import type { ReactElement } from 'react';
import { Pressable, View } from 'react-native';

import { CalendarIcon, ClockIcon } from '../../../../assets/icons';
import { Avatar, CustomText, StatusBadge } from '../../../../components';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import AppointmentCardStyles from './AppointmentCardStyles';
import type { AppointmentCardProps } from './AppointmentCardTypes';

/**
 * Upcoming appointment card: doctor, status badge and date/time pill.
 * @param {AppointmentCardProps} props - appointment data and press handler.
 * @returns {ReactElement} A React Element.
 */
const AppointmentCard = ({
  initials,
  doctorName,
  detail,
  badgeLabel,
  date,
  time,
  onPress
}: AppointmentCardProps): ReactElement => {
  const { styles, theme } = useTheme(AppointmentCardStyles);
  const iconColor = Colors[theme].navy;

  return (
    <Pressable
      accessibilityLabel={`${doctorName}, ${date}, ${time}`}
      accessibilityRole="button"
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.rowGap12}>
        <Avatar initials={initials} tone="green" />
        <View style={styles.colFlex}>
          <CustomText style={styles.textTitle}>{doctorName}</CustomText>
          <CustomText style={styles.textSub}>{detail}</CustomText>
        </View>
        {badgeLabel ? <StatusBadge label={badgeLabel} /> : null}
      </View>
      <View style={styles.appointmentMeta}>
        <View style={styles.appointmentMetaItem}>
          <CalendarIcon color={iconColor} size={scale(16)} />
          <CustomText style={styles.appointmentMetaText}>{date}</CustomText>
        </View>
        <View style={styles.appointmentMetaItem}>
          <ClockIcon color={iconColor} size={scale(16)} />
          <CustomText style={styles.appointmentMetaText}>{time}</CustomText>
        </View>
      </View>
    </Pressable>
  );
};

export default AppointmentCard;
