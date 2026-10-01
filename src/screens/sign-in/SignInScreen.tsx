import type { ReactElement } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { InfoIcon, LockIcon, PhoneIcon, PlusIcon } from "../../assets/icons";
import { CustomButton, CustomText, Screen, SegmentedTabs } from "../../components";
import { AUTH_TAB, BUTTON_VARIANT, Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { AuthInput } from "./components";
import SignInScreenStyles from "./SignInScreenStyles";
import useSignInScreen from "./useSignInScreen";

const COPY = Strings.SignInScreen;

/**
 * Sign in: choose mobile number or patient ID, request an OTP, or use a password.
 * @returns {ReactElement} A React Element.
 */
const SignInScreen = (): ReactElement => {
  const { styles, theme } = useTheme(SignInScreenStyles);
  const {
    tabs,
    activeTab,
    countries,
    selectedCountry,
    mobile,
    patientId,
    mobileError,
    patientIdError,
    patientIdMaxLength,
    isGetOtpDisabled,
    onTabPress,
    onCountrySelect,
    onMobileChange,
    onPatientIdChange,
    onMobileBlur,
    onPatientIdBlur,
    onGetOtpPress,
    onEmergencyPress,
  } = useSignInScreen();

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.body}
      >
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <PlusIcon color={Colors[theme].white} size={scale(24)} strokeWidth={2.6} />
          </View>
          <View style={styles.headingGroup}>
            <CustomText style={styles.eyebrow}>{COPY.hospitalName}</CustomText>
            <CustomText style={styles.authTitle}>{COPY.title}</CustomText>
            <CustomText style={styles.subtitle}>{COPY.subtitle}</CustomText>
          </View>
        </View>

        <SegmentedTabs activeId={activeTab} items={tabs} onPress={onTabPress} />

        {activeTab === AUTH_TAB.mobile ? (
          <AuthInput
            countries={countries}
            country={selectedCountry}
            error={mobileError}
            keyboardType="number-pad"
            label={COPY.tabMobileNumber}
            maxLength={selectedCountry.maxLength}
            placeholder={COPY.mobilePlaceholder}
            value={mobile}
            onBlur={onMobileBlur}
            onChangeText={onMobileChange}
            onCountrySelect={onCountrySelect}
          />
        ) : (
          <AuthInput
            autoCapitalize="characters"
            error={patientIdError}
            keyboardType="default"
            label={COPY.tabPatientId}
            maxLength={patientIdMaxLength}
            placeholder={COPY.patientIdPlaceholder}
            value={patientId}
            onBlur={onPatientIdBlur}
            onChangeText={onPatientIdChange}
          />
        )}

        <CustomButton
          disabled={isGetOtpDisabled}
          label={COPY.getOtp}
          variant={BUTTON_VARIANT.fill}
          onPress={onGetOtpPress}
        />

        <View style={styles.orRow}>
          <View style={styles.divider} />
          <CustomText style={styles.textXs}>{COPY.or}</CustomText>
          <View style={styles.divider} />
        </View>

        {/* Password sign-in flow is pending; shown disabled until it exists. */}
        <CustomButton
          disabled
          icon={<LockIcon color={Colors[theme].green} size={scale(20)} />}
          label={COPY.signInWithPassword}
          variant={BUTTON_VARIANT.line}
        />

        <View style={styles.infoCard}>
          <InfoIcon color={Colors[theme].blue} size={scale(20)} />
          <CustomText style={styles.infoText}>
            {COPY.newPatientPrefix}
            <CustomText style={styles.infoTextBold}>
              {COPY.websiteLink}
            </CustomText>
            {COPY.newPatientSuffix}
          </CustomText>
        </View>

        <Pressable
          accessibilityLabel={COPY.emergencyCall}
          accessibilityRole="link"
          style={styles.emergencyRow}
          onPress={onEmergencyPress}
        >
          <PhoneIcon color={Colors[theme].coral} size={scale(16)} />
          <CustomText style={styles.emergencyText}>{COPY.emergencyCall}</CustomText>
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignInScreen;
