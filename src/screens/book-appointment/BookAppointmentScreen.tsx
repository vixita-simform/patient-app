import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIcon, ClockIcon, HomeIcon, VideoIcon } from "../../assets/icons";
import { Avatar, CustomButton, CustomText } from "../../components";
import { BUTTON_VARIANT, Strings, VISIT_MODE } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import BookAppointmentScreenStyles from "./BookAppointmentScreenStyles";
import {
  CalendarModal,
  DateChip,
  TimeSlotChip,
  VisitTypeCard,
} from "./components";
import useBookAppointmentScreen from "./useBookAppointmentScreen";

const TOP_EDGE = Object.freeze(["top"] as const);

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
    summaryLabel,
    feeLabel,
    footerInsetStyle,
    reasonInputRef,
    isIosPickerVisible,
    onBackPress,
    onChangeMonthPress,
    onIosDateChange,
    onDismissIosPicker,
    today,
    onSelectDate,
    onSelectSlot,
    onSelectVisitType,
    onChangeReason,
    onConfirmPress,
  } = useBookAppointmentScreen();

  const [footerHeight, setFooterHeight] = useState(0);
  const onFooterLayout = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  }, []);

  const stateContent = isLoading ? (
    <ActivityIndicator color={Colors[theme].green} />
  ) : (
    <CustomText style={styles.stateText}>
      {Strings.BookAppointmentScreen.notFound}
    </CustomText>
  );

  return (
    <SafeAreaView edges={TOP_EDGE} style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={Strings.Common.back}
          accessibilityRole="button"
          style={styles.iconBtn}
          onPress={onBackPress}
        >
          <BackIcon color={Colors[theme].navy} size={scale(20)} />
        </Pressable>
        <CustomText style={styles.headerTitle}>
          {Strings.DoctorProfileScreen.bookAppointment}
        </CustomText>
        <View style={[styles.iconBtn, styles.iconBtnGhost]} />
      </View>

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
                <Avatar initials={doctor.summary.initials} tone="green" />
                <View style={[styles.col, styles.flex1]}>
                  <CustomText style={styles.tTitle}>
                    {doctor.summary.name}
                  </CustomText>
                  <CustomText style={styles.tSub}>
                    {doctor.summary.specialtyLabel} · {feeLabel}
                  </CustomText>
                </View>
              </View>

              <View>
                <View style={styles.sectionTitle}>
                  <CustomText style={styles.sectionTitleH3}>
                    {monthLabel}
                  </CustomText>
                  <Pressable
                    accessibilityRole="button"
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
                      active={day.id === selectedDateId}
                      dayNumber={day.dayNumber}
                      disabled={day.disabled}
                      key={day.id}
                      weekday={day.weekday}
                      onPress={() => onSelectDate(day.id)}
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
                      key={slot.id}
                      label={slot.label}
                      status={slot.status}
                      onPress={() => onSelectSlot(slot.id)}
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
                    subtitle={Strings.BookAppointmentScreen.atTheHospital}
                    title={Strings.BookAppointmentScreen.inPerson}
                    onPress={() => onSelectVisitType(VISIT_MODE.inPerson)}
                  />
                  <VisitTypeCard
                    active={selectedVisitType === VISIT_MODE.video}
                    Icon={VideoIcon}
                    iconColor={Colors[theme].blue}
                    subtitle={Strings.BookAppointmentScreen.fromHome}
                    title={Strings.BookAppointmentScreen.videoCall}
                    onPress={() => onSelectVisitType(VISIT_MODE.video)}
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
          <View
            style={[styles.footerBar, footerInsetStyle]}
            onLayout={onFooterLayout}
          >
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
          onChange={onIosDateChange}
          onDismiss={onDismissIosPicker}
        />
      )}
    </SafeAreaView>
  );
}
