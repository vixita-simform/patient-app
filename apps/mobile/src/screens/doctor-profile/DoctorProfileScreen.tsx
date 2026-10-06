import { type ReactElement } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronRightIcon, PinIcon, VideoIcon } from "../../assets/icons";
import { CustomText, StatusBadge } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { formatCurrency } from "../../utils";
import { DoctorHero, OpdHoursCard, StatsCard } from "./components";
import DoctorProfileScreenStyles from "./DoctorProfileScreenStyles";
import useDoctorProfileScreen from "./useDoctorProfileScreen";

const TOP_EDGE = Object.freeze(["top"] as const);

/**
 * Doctor profile: fixed green hero and footer, with the details scrolling between them.
 * @returns {ReactElement} A React Element.
 */
export default function DoctorProfileScreen(): ReactElement {
  const { styles, theme } = useTheme(DoctorProfileScreenStyles);
  const {
    doctor,
    isLoading,
    isError,
    isFavourite,
    footerInsetStyle,
    onBackPress,
    onFavouritePress,
    onVideoPress,
    onBookPress,
  } = useDoctorProfileScreen();

  // Loading -> error -> empty (unknown id) are rendered in place of the details.
  const stateContent = isLoading ? (
    <ActivityIndicator color={Colors[theme].green} />
  ) : (
    <CustomText style={styles.stateText}>
      {isError ? Strings.DoctorProfileScreen.loadError : Strings.DoctorProfileScreen.notFound}
    </CustomText>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView edges={TOP_EDGE} style={styles.heroSafeArea}>
        <DoctorHero
          initials={doctor?.summary.initials ?? ""}
          isFavourite={isFavourite}
          name={doctor?.summary.name ?? ""}
          qualifications={doctor?.details.qualifications ?? ""}
          onBackPress={onBackPress}
          onFavouritePress={onFavouritePress}
        />
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        style={styles.body}
      >
        {/* Green band the stats card overlaps, so the overlap scrolls with the content. */}
        <View style={styles.overlapBand} />
        {isLoading || isError || !doctor ? (
          stateContent
        ) : (
          <View style={styles.bodyInner}>
            <StatsCard
              experience={`${doctor.summary.experienceYears} ${Strings.DoctorProfileScreen.yrs}`}
              patients={doctor.details.patientsCount}
              rating={doctor.summary.rating}
            />
            <View style={styles.aboutSection}>
              <CustomText style={styles.sectionTitle}>{Strings.DoctorProfileScreen.about}</CustomText>
              <CustomText style={styles.paragraph}>{doctor.details.about}</CustomText>
            </View>
            <OpdHoursCard rows={doctor.details.opdHours} />
            <View style={styles.locationCard}>
              <View style={styles.iconBoxBlue}>
                <PinIcon color={Colors[theme].blue} size={scale(20)} />
              </View>
              <View style={styles.locationTextCol}>
                <CustomText style={styles.textTitle}>{doctor.details.locationTitle}</CustomText>
                <CustomText style={styles.textSub}>{doctor.details.locationSubtitle}</CustomText>
              </View>
              <ChevronRightIcon color={Colors[theme].muted} size={scale(20)} />
            </View>
            <View style={styles.feeCard}>
              <View style={styles.col}>
                <CustomText style={styles.textXs}>{Strings.DoctorProfileScreen.consultationFee}</CustomText>
                <CustomText style={styles.feeAmount}>{formatCurrency(doctor.details.consultationFee)}</CustomText>
              </View>
              {doctor.details.insuranceAccepted && (
                <StatusBadge label={Strings.DoctorProfileScreen.insuranceAccepted} />
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={StyleSheet.flatten([styles.footerBar, footerInsetStyle])}>
        <Pressable
          accessibilityLabel={Strings.DoctorProfileScreen.videoConsult}
          accessibilityRole="button"
          style={styles.footerIconButton}
          onPress={onVideoPress}
        >
          <VideoIcon color={Colors[theme].green} size={scale(20)} />
        </Pressable>
        <Pressable
          accessibilityLabel={Strings.DoctorProfileScreen.bookAppointment}
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={onBookPress}
        >
          <CustomText style={styles.primaryButtonText}>{Strings.DoctorProfileScreen.bookAppointment}</CustomText>
        </Pressable>
      </View>
    </View>
  );
}
