import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

import { ClockIcon, HomeIcon, VideoIcon } from "../../assets/icons";
import {
  Avatar,
  CalendarModal,
  CustomButton,
  CustomText,
  Screen,
  ScreenHeader,
} from "../../components";
import {
  AVATAR_TONE,
  BUTTON_VARIANT,
  Strings,
  VISIT_MODE,
} from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import BookAppointmentScreenStyles from "./BookAppointmentScreenStyles";
import { DateChip, TimeSlotChip, VisitTypeCard } from "./components";
import useBookAppointmentScreen from "./useBookAppointmentScreen";

/** Grows the text-sized "Change month" link to at least a 44pt target. */
const LINK_HIT_SLOP = scale(12);

/**
 * Book appointment: doctor summary, date/time slot pickers, visit type and
 * reason for visit, with a sticky confirm footer.
 * @returns {ReactElement} A React Element.
 */
export default function BookAppointmentScreen(): ReactElement {
  const { styles, theme } = useTheme(BookAppointmentScreenStyles);
  const {
    doctor,
    isLoading,
    isError,
    monthLabel,
    dateStripDays,
    selectedDateId,
    selectedDate,
    timeSlots,
    selectedVisitType,
    reason,
    doctorSubtitle,
    summaryLabel,
    feeLabel,
    footerInsetStyle,
    footerHeight,
    isConfirmDisabled,
    reasonInputRef,
    isIosPickerVisible,
    onBackPress,
    onChangeMonthPress,
    onIosDateChange,
    onDismissIosPicker,
    onFooterLayout,
    today,
    onSelectDate,
    onSelectSlot,
    onSelectVisitType,
    onChangeReason,
    onConfirmPress,
  } = useBookAppointmentScreen();

  const footerBarStyle = useMemo(
    () => StyleSheet.flatten([styles.footerBar, footerInsetStyle]),
    [styles.footerBar, footerInsetStyle],
  );

  const stateContent = isLoading ? (
    <ActivityIndicator color={Colors[theme].green} />
  ) : (
    <CustomText style={styles.stateText}>
      {isError
        ? Strings.DoctorProfileScreen.loadError
        : Strings.DoctorProfileScreen.notFound}
    </CustomText>
  );

  return (
    <Screen>
      <ScreenHeader
        title={Strings.DoctorProfileScreen.bookAppointment}
        onBackPress={onBackPress}
      />

      <View style={styles.bodyWrapper}>
        <KeyboardAwareScrollView
          bottomOffset={footerHeight}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          {isLoading || isError || !doctor ? (
            stateContent
          ) : (
            <>
              <View style={styles.doctorCard}>
                <Avatar
                  initials={doctor.summary.initials}
                  tone={AVATAR_TONE.green}
                />
                <View style={styles.doctorInfo}>
                  <CustomText style={styles.tTitle}>
                    {doctor.summary.name}
                  </CustomText>
                  <CustomText style={styles.tSub}>{doctorSubtitle}</CustomText>
                </View>
              </View>

              <View>
                <View style={styles.sectionTitle}>
                  <CustomText style={styles.sectionTitleH3}>
                    {monthLabel}
                  </CustomText>
                  <Pressable
                    accessibilityLabel={Strings.BookAppointmentScreen.changeMonth}
                    accessibilityRole="button"
                    hitSlop={LINK_HIT_SLOP}
                    onPress={onChangeMonthPress}
                  >
                    <CustomText style={styles.sectionTitleLink}>
                      {Strings.BookAppointmentScreen.changeMonth}
                    </CustomText>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.hScrollContent}
                  showsHorizontalScrollIndicator={false}
                  style={styles.hScroll}
                >
                  {dateStripDays.map((day) => (
                    <DateChip
                      accessibilityLabel={day.accessibilityLabel}
                      active={day.id === selectedDateId}
                      dayNumber={day.dayNumber}
                      disabled={day.disabled}
                      id={day.id}
                      key={day.id}
                      weekday={day.weekday}
                      onPress={onSelectDate}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.col}>
                <CustomText style={styles.h3Inline}>
                  {Strings.BookAppointmentScreen.availableSlots}
                </CustomText>
                <View style={styles.slots}>
                  {timeSlots.map((slot) => (
                    <TimeSlotChip
                      id={slot.id}
                      key={slot.id}
                      label={slot.label}
                      status={slot.status}
                      onPress={onSelectSlot}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.col}>
                <CustomText style={styles.h3Inline}>
                  {Strings.BookAppointmentScreen.visitType}
                </CustomText>
                <View style={styles.visitTypeRow}>
                  <VisitTypeCard
                    active={selectedVisitType === VISIT_MODE.inPerson}
                    Icon={HomeIcon}
                    iconColor={Colors[theme].green}
                    id={VISIT_MODE.inPerson}
                    subtitle={Strings.BookAppointmentScreen.atTheHospital}
                    title={Strings.Common.inPerson}
                    onPress={onSelectVisitType}
                  />
                  <VisitTypeCard
                    active={selectedVisitType === VISIT_MODE.video}
                    Icon={VideoIcon}
                    iconColor={Colors[theme].blue}
                    id={VISIT_MODE.video}
                    subtitle={Strings.BookAppointmentScreen.fromHome}
                    title={Strings.Common.videoCall}
                    onPress={onSelectVisitType}
                  />
                </View>
              </View>

              <View style={styles.reasonSection}>
                <CustomText style={styles.h3Inline}>
                  {Strings.BookAppointmentScreen.reasonForVisit}
                </CustomText>
                <TextInput
                  multiline
                  accessibilityLabel={
                    Strings.BookAppointmentScreen.reasonForVisit
                  }
                  placeholder={Strings.BookAppointmentScreen.reasonPlaceholder}
                  placeholderTextColor={Colors[theme].muted}
                  ref={reasonInputRef}
                  style={styles.reasonInput}
                  value={reason}
                  onChangeText={onChangeReason}
                />
              </View>
            </>
          )}
        </KeyboardAwareScrollView>

        <KeyboardStickyView>
          <View style={footerBarStyle} onLayout={onFooterLayout}>
            <View style={styles.footerRow}>
              <View style={styles.footerSummary}>
                <ClockIcon color={Colors[theme].muted} size={scale(14)} />
                <CustomText style={styles.tSub}>
                  {summaryLabel ||
                    Strings.BookAppointmentScreen.selectATimeSlot}
                </CustomText>
              </View>
              <CustomText style={styles.footerFee}>{feeLabel}</CustomText>
            </View>
            <CustomButton
              accessibilityLabel={Strings.BookAppointmentScreen.confirmBooking}
              disabled={isConfirmDisabled}
              label={Strings.BookAppointmentScreen.confirmBooking}
              style={styles.btnPrimary}
              variant={BUTTON_VARIANT.fill}
              onPress={onConfirmPress}
            />
          </View>
        </KeyboardStickyView>
      </View>

      {Platform.OS === "ios" && (
        <CalendarModal
          minimumDate={today}
          selectedDate={selectedDate}
          visible={isIosPickerVisible}
          onConfirm={onIosDateChange}
          onDismiss={onDismissIosPicker}
        />
      )}
    </Screen>
  );
}
