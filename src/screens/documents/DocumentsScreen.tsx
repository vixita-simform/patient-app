import type { ReactElement } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { CalendarIcon, ChevronDownIcon, SearchIcon } from "../../assets/icons";
import { AppText, Screen, Sheet } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { fillTemplate } from "../../utils";
import { DocumentCard, FilterChip, YearOptionRow } from "./components";
import DocumentsScreenStyles from "./DocumentsScreenStyles";
import useDocumentsScreen, { ALL_FILTER } from "./useDocumentsScreen";

const SEARCH_ICON_SIZE = scale(14);
const CALENDAR_ICON_SIZE = scale(13);
const CHEVRON_ICON_SIZE = scale(10);
const CHEVRON_STROKE = 2.5;

/**
 * Documents tab: searchable, filterable, paginated document list.
 * @returns {ReactElement} A React Element.
 */
export default function DocumentsScreen(): ReactElement {
  const { styles, theme } = useTheme(DocumentsScreenStyles);
  const {
    query,
    year,
    years,
    filter,
    filterOptions,
    yearSheetVisible,
    filteredDocuments,
    shownDocuments,
    remainingCount,
    onChangeQuery,
    onOpenYearSheet,
    onCloseYearSheet,
    onSelectYear,
    onSelectFilter,
    onLoadMore,
  } = useDocumentsScreen();
  const strings = Strings.DocumentsScreen;
  const yearActive = year !== ALL_FILTER;
  const yearIconColor = yearActive ? Colors[theme].primary : Colors[theme].textSecondary;
  const loadMoreLabel = fillTemplate(Strings.Common.loadMoreCount, { count: remainingCount });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.title}>{strings.title}</AppText>
          <AppText style={styles.subtitle}>{strings.subtitle}</AppText>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <TextInput
              placeholder={strings.searchPlaceholder}
              placeholderTextColor={Colors[theme].textSecondary}
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
              onChangeText={onChangeQuery}
            />
            <View style={styles.searchIconWrap}>
              <SearchIcon color={Colors[theme].textSecondary} size={SEARCH_ICON_SIZE} />
            </View>
          </View>
          <Pressable
            accessibilityLabel={strings.filterByYear}
            accessibilityRole="button"
            style={[styles.yearButton, yearActive && styles.yearButtonActive]}
            onPress={onOpenYearSheet}>
            <CalendarIcon color={yearIconColor} size={CALENDAR_ICON_SIZE} />
            <AppText style={[styles.yearButtonText, yearActive && styles.yearButtonTextActive]}>
              {yearActive ? year : strings.year}
            </AppText>
            <ChevronDownIcon
              color={yearIconColor}
              size={CHEVRON_ICON_SIZE}
              strokeWidth={CHEVRON_STROKE}
            />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chipRow}
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}>
          {filterOptions.map((t) => (
            <FilterChip
              active={filter === t}
              key={t}
              label={t === ALL_FILTER ? strings.all : t}
              value={t}
              onSelect={onSelectFilter}
            />
          ))}
        </ScrollView>
        <View style={styles.docList}>
          {shownDocuments.map((doc) => (
            <DocumentCard document={doc} key={doc.id} />
          ))}
        </View>
        {remainingCount > 0 ? (
          <Pressable
            accessibilityLabel={loadMoreLabel}
            accessibilityRole="button"
            style={styles.loadMoreButton}
            onPress={onLoadMore}>
            <AppText style={styles.loadMoreText}>{loadMoreLabel}</AppText>
          </Pressable>
        ) : null}
        {filteredDocuments.length > 0 ? (
          <AppText style={styles.countText}>
            {fillTemplate(strings.showingCount, {
              shown: shownDocuments.length,
              total: filteredDocuments.length,
            })}
          </AppText>
        ) : null}
      </ScrollView>
      <Sheet title={strings.filterByYear} visible={yearSheetVisible} onClose={onCloseYearSheet}>
        {years.map((y) => (
          <YearOptionRow
            active={year === y}
            key={y}
            label={y === ALL_FILTER ? strings.allYears : y}
            value={y}
            onSelect={onSelectYear}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
