import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import { SearchIcon } from "../../assets/icons";
import { CustomText, IconButton, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { RecordGroupCard, RecordSummaryCard } from "./components";
import RecordsScreenStyles from "./RecordsScreenStyles";
import useRecordsScreen from "./useRecordsScreen";

/**
 * Medical Records tab: header, a green summary
 * strip (lab reports / prescriptions / discharges counts), then
 * month-grouped cards of record rows. Static dummy data stands in for the
 * API — see `useRecordsScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function RecordsScreen(): ReactElement {
  const { styles, theme } = useTheme(RecordsScreenStyles);
  const { summaryTiles, groups, onRecordPress, onSummaryTilePress } = useRecordsScreen();

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <CustomText style={styles.headerTitle}>
            {Strings.RecordsScreen.headerTitle}
          </CustomText>
          {/* Disabled until record search exists. */}
          <IconButton disabled accessibilityLabel={Strings.RecordsScreen.search}>
            <SearchIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
        </View>
        <ScrollView
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          <RecordSummaryCard tiles={summaryTiles} onTilePress={onSummaryTilePress} />
          {groups.map((group) => (
            <View key={group.id} style={styles.group}>
              <CustomText style={styles.groupLabel}>{group.monthLabel}</CustomText>
              <RecordGroupCard records={group.records} onRecordPress={onRecordPress} />
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
