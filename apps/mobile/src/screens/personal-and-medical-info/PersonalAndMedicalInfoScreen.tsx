import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { CalendarIcon } from '../../assets/icons';
import {
  CalendarModal,
  CustomButton,
  FormField,
  Screen,
  ScreenHeader,
  TextField
} from '../../components';
import { Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import { ChipGroup, EditableAvatar, TagList } from './components';
import PersonalAndMedicalInfoScreenStyles from './PersonalAndMedicalInfoScreenStyles';
import usePersonalAndMedicalInfoScreen from './usePersonalAndMedicalInfoScreen';

const COPY = Strings.PersonalAndMedicalInfoScreen;

/**
 * Personal & medical info form: editable avatar, name, date of birth, gender,
 * blood group, allergies, existing conditions and emergency contact, with a
 * sticky "Save changes" footer. Reached from the Profile menu.
 * @returns {ReactElement} A React Element.
 */
export default function PersonalAndMedicalInfoScreen(): ReactElement {
  const { styles, theme } = useTheme(PersonalAndMedicalInfoScreenStyles);
  const form = usePersonalAndMedicalInfoScreen();
  const calendarIcon = useMemo(
    () => <CalendarIcon color={Colors[theme].muted} size={scale(20)} />,
    [theme]
  );

  return (
    <Screen>
      <View style={styles.phone}>
        <ScreenHeader title={COPY.title} onBackPress={form.onBackPress} />
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          <EditableAvatar
            accessibilityLabel={COPY.editPhoto}
            initials={form.initials}
            onPress={form.onAvatarPress}
          />
          <TextField
            label={COPY.fullName}
            value={form.fullName}
            onChangeText={form.onFullNameChange}
          />
          <TextField
            label={COPY.dateOfBirth}
            trailingIcon={calendarIcon}
            value={form.dateOfBirthLabel}
            onPress={form.onDateOfBirthPress}
          />
          <FormField label={COPY.gender}>
            <ChipGroup
              options={form.genderOptions}
              selectedId={form.gender}
              onSelect={form.onGenderSelect}
            />
          </FormField>
          <FormField label={Strings.Common.bloodGroup}>
            <ChipGroup
              options={form.bloodGroupOptions}
              selectedId={form.bloodGroup}
              onSelect={form.onBloodGroupSelect}
            />
          </FormField>
          <FormField label={COPY.allergies}>
            <TagList
              addLabel={COPY.addAllergy}
              removeLabel={COPY.removeAllergy}
              tags={form.allergies}
              onAdd={form.onAllergyAdd}
              onRemove={form.onAllergyRemove}
            />
          </FormField>
          <TextField
            label={COPY.existingConditions}
            value={form.existingConditions}
            onChangeText={form.onExistingConditionsChange}
          />
          <TextField
            label={COPY.emergencyContact}
            trailingText={form.emergencyContactPhone}
            value={form.emergencyContactName}
            onChangeText={form.onEmergencyContactNameChange}
          />
        </ScrollView>
        <View style={styles.footerBar}>
          <CustomButton
            disabled={!form.onSavePress}
            label={COPY.saveChanges}
            onPress={form.onSavePress}
          />
        </View>
      </View>
      {form.shouldRenderIosPicker && (
        <CalendarModal
          maximumDate={form.maximumDate}
          selectedDate={form.dateOfBirth}
          visible={form.isIosPickerVisible}
          onConfirm={form.onIosDateChange}
          onDismiss={form.onDismissIosPicker}
        />
      )}
    </Screen>
  );
}
