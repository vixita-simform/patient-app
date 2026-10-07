import type { ReactElement } from 'react';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { InfoIcon, LockIcon, PhoneIcon, PlusIcon } from '../../assets/icons';
import { CustomButton, CustomText, Screen, SegmentedTabs, TextField } from '../../components';
import { AUTH_TAB, BUTTON_VARIANT, Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import { CountryCodePicker } from './components';
import SignInScreenStyles from './SignInScreenStyles';
import useSignInScreen from './useSignInScreen';

/** Grows the "Emergency? Call 108" link to at least a 44pt target. */
const EMERGENCY_HIT_SLOP = scale(12);

/**
 * Sign in: choose mobile number or patient ID, then request an OTP or enter a password.
 * @returns {ReactElement} A React Element.
 */
const SignInScreen = (): ReactElement => {
  const { styles, theme } = useTheme(SignInScreenStyles);
  const {
    tabs,
    activeTab,
    isPasswordMode,
    countries,
    selectedCountry,
    mobile,
    patientId,
    password,
    mobileError,
    patientIdError,
    passwordError,
    patientIdMaxLength,
    isSubmitDisabled,
    isSubmitting,
    onTabPress,
    onCountrySelect,
    onMobileChange,
    onPatientIdChange,
    onMobileBlur,
    onPatientIdBlur,
    onPasswordChange,
    onPasswordBlur,
    onAuthMethodToggle,
    onSubmitPress,
    onEmergencyPress
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
            <CustomText style={styles.eyebrow}>{Strings.SignInScreen.hospitalName}</CustomText>
            <CustomText style={styles.authTitle}>{Strings.SignInScreen.title}</CustomText>
            <CustomText style={styles.subtitle}>{Strings.SignInScreen.subtitle}</CustomText>
          </View>
        </View>

        <SegmentedTabs activeId={activeTab} items={tabs} onPress={onTabPress} />

        {activeTab === AUTH_TAB.mobile ? (
          <TextField
            error={mobileError}
            keyboardType="number-pad"
            label={Strings.SignInScreen.tabMobileNumber}
            leading={
              <>
                <CountryCodePicker
                  countries={countries}
                  selected={selectedCountry}
                  onSelect={onCountrySelect}
                />
                <View style={styles.vLine} />
              </>
            }
            maxLength={selectedCountry.maxLength}
            placeholder={Strings.SignInScreen.mobilePlaceholder}
            value={mobile}
            onBlur={onMobileBlur}
            onChangeText={onMobileChange}
          />
        ) : (
          <TextField
            autoCapitalize="characters"
            error={patientIdError}
            keyboardType="default"
            label={Strings.SignInScreen.tabPatientId}
            maxLength={patientIdMaxLength}
            placeholder={Strings.SignInScreen.patientIdPlaceholder}
            value={patientId}
            onBlur={onPatientIdBlur}
            onChangeText={onPatientIdChange}
          />
        )}
        {isPasswordMode ? (
          <TextField
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            error={passwordError}
            label={Strings.SignInScreen.passwordLabel}
            placeholder={Strings.SignInScreen.passwordPlaceholder}
            value={password}
            onBlur={onPasswordBlur}
            onChangeText={onPasswordChange}
            onSubmitEditing={onSubmitPress}
          />
        ) : null}
        <CustomButton
          disabled={isSubmitDisabled}
          label={isPasswordMode ? Strings.SignInScreen.signIn : Strings.SignInScreen.getOtp}
          loading={isSubmitting}
          variant={BUTTON_VARIANT.fill}
          onPress={onSubmitPress}
        />
        <View style={styles.orRow}>
          <View style={styles.divider} />
          <CustomText style={styles.textXs}>{Strings.SignInScreen.or}</CustomText>
          <View style={styles.divider} />
        </View>
        <CustomButton
          icon={
            isPasswordMode ? undefined : <LockIcon color={Colors[theme].green} size={scale(20)} />
          }
          label={
            isPasswordMode
              ? Strings.SignInScreen.signInWithOtp
              : Strings.SignInScreen.signInWithPassword
          }
          variant={BUTTON_VARIANT.line}
          onPress={onAuthMethodToggle}
        />

        <View style={styles.infoCard}>
          <InfoIcon color={Colors[theme].blue} size={scale(20)} />
          <CustomText style={styles.infoText}>
            {Strings.SignInScreen.newPatientPrefix}
            <CustomText style={styles.infoTextBold}>{Strings.SignInScreen.websiteLink}</CustomText>
            {Strings.SignInScreen.newPatientSuffix}
          </CustomText>
        </View>

        <Pressable
          accessibilityLabel={Strings.SignInScreen.emergencyCall}
          accessibilityRole="link"
          hitSlop={EMERGENCY_HIT_SLOP}
          style={styles.emergencyRow}
          onPress={onEmergencyPress}
        >
          <PhoneIcon color={Colors[theme].coral} size={scale(16)} />
          <CustomText style={styles.emergencyText}>{Strings.SignInScreen.emergencyCall}</CustomText>
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignInScreen;
