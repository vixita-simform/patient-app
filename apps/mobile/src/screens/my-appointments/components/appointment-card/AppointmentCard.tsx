import type { ReactElement } from "react";
import { Pressable, View } from "react-native";

import { Avatar, CustomButton, CustomText, StatusBadge } from "../../../../components";
import { CalendarIcon, ClockIcon, VideoIcon } from "../../../../assets/icons";
import { APPOINTMENT_ACTION_ICON, Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import AppointmentCardStyles from "./AppointmentCardStyles";
import type { AppointmentCardProps } from "./AppointmentCardTypes";

/**
 * Appointment card: doctor row with status badge, date/time meta pill, and an
 * optional action row (Reschedule/Get directions or Cancel/Join call). The
 * doctor/date summary navigates to the doctor profile; the action row is a sibling
 * of that pressable, so each action is its own screen-reader stop.
 * @param {AppointmentCardProps} props - appointment data, actions and press handler.
 * @returns {ReactElement} A React Element.
 */
const AppointmentCard = ({
  initials,
  avatarTone,
  doctorName,
  specialtyLabel,
  visitModeLabel,
  badgeLabel,
  badgeTone,
  date,
  time,
  actions,
  onPress,
}: AppointmentCardProps): ReactElement => {
  const { styles, theme } = useTheme(AppointmentCardStyles);
  const iconColor = Colors[theme].navy;
  const detail = `${specialtyLabel}${Strings.Common.dotSeparator}${visitModeLabel}`;

  return (
    <View style={styles.card}>
      {/* The summary is one button; the action row sits outside it so screen readers can reach each action. */}
      <Pressable
        accessibilityLabel={`${doctorName}, ${date}, ${time}`}
        accessibilityRole="button"
        style={styles.summary}
        onPress={onPress}
      >
        <View style={styles.apptTop}>
          <Avatar initials={initials} tone={avatarTone} />
          <View style={styles.apptInfo}>
            <CustomText style={styles.apptTitle}>{doctorName}</CustomText>
            <CustomText style={styles.apptSub}>{detail}</CustomText>
          </View>
          <StatusBadge label={badgeLabel} tone={badgeTone} />
        </View>
        <View style={styles.apptMeta}>
          <View style={styles.apptMetaItem}>
            <CalendarIcon color={iconColor} size={scale(16)} />
            <CustomText style={styles.apptMetaText}>{date}</CustomText>
          </View>
          <View style={styles.apptMetaItem}>
            <ClockIcon color={iconColor} size={scale(16)} />
            <CustomText style={styles.apptMetaText}>{time}</CustomText>
          </View>
        </View>
      </Pressable>
      {actions?.length ? (
        <View style={styles.apptActions}>
          {actions.map((action) => (
            <CustomButton
              accessibilityLabel={action.label}
              disabled={action.disabled}
              icon={action.icon === APPOINTMENT_ACTION_ICON.video ? (
                <VideoIcon color={Colors[theme].white} size={scale(16)} />
              ) : undefined}
              key={action.label}
              label={action.label}
              style={styles.apptActionBtn}
              textStyle={styles.apptActionBtnText}
              variant={action.variant}
              onPress={action.onPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default AppointmentCard;
