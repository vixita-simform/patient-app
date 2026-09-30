import { type ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { BackIcon, FilterIcon, SearchIcon } from "../../assets/icons";
import { CustomText, IconButton, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { SpecialtyChip } from "./components";
import FindADoctorScreenStyles from "./FindADoctorScreenStyles";
import type { FindADoctorScreenProps } from "./FindADoctorScreenTypes";
import useFindADoctorScreen from "./useFindADoctorScreen";

/**
 * Find a doctor: header, static search, specialty chips, count and doctor list.
 * Reused as both the "Book visit" stack screen and the Visits tab root
 * (`showBackButton: false` there, since a tab root has nothing to go back to).
 * @param {FindADoctorScreenProps} props - display options.
 * @returns {ReactElement} A React Element.
 */
export default function FindADoctorScreen({
  showBackButton = true,
}: FindADoctorScreenProps = {}): ReactElement {
  const { styles, theme } = useTheme(FindADoctorScreenStyles);
  const {
    chips,
    listData,
    countLabel,
    isLoading,
    isError,
    selectedSpecialty,
    searchQuery,
    onSearchChange,
    onSpecialtyPress,
    renderItem,
    keyExtractor,
    onBackPress,
    onFilterPress,
  } = useFindADoctorScreen();

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.search}>
        <SearchIcon color={Colors[theme].muted} size={scale(20)} />
        <TextInput
          accessibilityLabel={Strings.FindADoctorScreen.searchPlaceholder}
          autoCorrect={false}
          clearButtonMode="while-editing"
          placeholder={Strings.FindADoctorScreen.searchPlaceholder}
          placeholderTextColor={Colors[theme].muted}
          returnKeyType="search"
          style={styles.searchText}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.hScrollContent}
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
      >
        {chips.map((chip) => (
          <SpecialtyChip
            active={chip.id === selectedSpecialty}
            id={chip.id}
            key={chip.id}
            label={chip.label}
            onPress={onSpecialtyPress}
          />
        ))}
      </ScrollView>
      <CustomText style={styles.countText}>
        {countLabel}
      </CustomText>
    </View>
  );

  // Loading -> error -> empty are rendered in place of the rows.
  const listEmpty = isLoading ? (
    <ActivityIndicator color={Colors[theme].green} />
  ) : (
    <CustomText style={styles.stateText}>
      {isError
        ? Strings.FindADoctorScreen.errorMessage
        : Strings.FindADoctorScreen.emptyMessage}
    </CustomText>
  );

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.header}>
          {showBackButton ? (
            <IconButton
              accessibilityLabel={Strings.Common.back}
              onPress={onBackPress}
            >
              <BackIcon color={Colors[theme].navy} size={scale(20)} />
            </IconButton>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <CustomText style={styles.headerTitle}>
            {Strings.FindADoctorScreen.title}
          </CustomText>
          <IconButton
            accessibilityLabel={Strings.FindADoctorScreen.filter}
            onPress={onFilterPress}
          >
            <FilterIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
        </View>
        <KeyboardAvoidingView behavior="padding" style={styles.body}>
          <FlatList
            contentContainerStyle={styles.bodyContent}
            data={listData}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            keyExtractor={keyExtractor}
            ListEmptyComponent={listEmpty}
            ListHeaderComponent={listHeader}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={styles.body}
          />
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
}
