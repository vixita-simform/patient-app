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
 * whole card navigates to the doctor profile; action buttons stop propagation
 * so they do not also trigger the card's own press.
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
    <Pressable
      accessibilityLabel={`${doctorName}, ${date}, ${time}`}
      accessibilityRole="button"
      style={styles.card}
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
      {actions?.length ? (
        // Nested Pressables each claim their own touch responder in RN (no DOM-style
        // event bubbling), so these action buttons never also trigger the card's onPress.
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
    </Pressable>
  );
};

export default AppointmentCard;
