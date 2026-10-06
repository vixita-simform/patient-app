import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import { AlertIcon, DownloadIcon, ShareIcon } from "../../assets/icons";
import { CustomButton, CustomText, IconButton, Screen, ScreenHeader } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { LabResultRow } from "./components";
import LabReportDetailScreenStyles from "./LabReportDetailScreenStyles";
import useLabReportDetailScreen from "./useLabReportDetailScreen";

/** Shared size for the header, alert and footer icons. */
const ICON_SIZE = scale(20);

/**
 * Lab Report Detail: fixed header (back/title/share), a scrolling body of a
 * meta card, a conditional out-of-range alert card and the results card, and
 * a sticky footer "Download PDF" button. Static dummy data stands in for the
 * API — see `useLabReportDetailScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function LabReportDetailScreen(): ReactElement {
  const { styles, theme } = useTheme(LabReportDetailScreenStyles);
  const {
    report,
    title,
    sampleCollectedLabel,
    results,
    showAlert,
    onBackPress,
    onSharePress,
    onDownloadPress,
  } = useLabReportDetailScreen();
  const isShareDisabled = !onSharePress;
  const isDownloadDisabled = !onDownloadPress;

  return (
    <Screen>
      <View style={styles.screen}>
        <ScreenHeader
          right={
            <IconButton
              accessibilityLabel={Strings.LabReportDetailScreen.share}
              disabled={isShareDisabled}
              onPress={onSharePress}
            >
              <ShareIcon color={Colors[theme].navy} size={ICON_SIZE} />
            </IconButton>
          }
          title={title}
          onBackPress={onBackPress}
        />
        <ScrollView
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          {!report ? (
            <CustomText style={styles.notFoundText}>
              {Strings.LabReportDetailScreen.notFound}
            </CustomText>
          ) : (
            <>
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <CustomText style={styles.tSub}>
                    {Strings.LabReportDetailScreen.sampleCollected}
                  </CustomText>
                  <CustomText style={styles.metaValue}>{sampleCollectedLabel}</CustomText>
                </View>
                <View style={styles.metaRow}>
                  <CustomText style={styles.tSub}>
                    {Strings.LabReportDetailScreen.orderedBy}
                  </CustomText>
                  <CustomText style={styles.metaValue}>{report.orderedByDoctorName}</CustomText>
                </View>
                <View style={styles.metaRow}>
                  <CustomText style={styles.tSub}>
                    {Strings.LabReportDetailScreen.reportId}
                  </CustomText>
                  <CustomText style={styles.metaValue}>{report.reportId}</CustomText>
                </View>
              </View>
              {showAlert && (
                <View style={styles.alertCard}>
                  <View style={styles.alertIcon}>
                    <AlertIcon color={Colors[theme].coral} size={ICON_SIZE} />
                  </View>
                  <CustomText style={styles.alertText}>{report.alertMessage}</CustomText>
                </View>
              )}
              <View style={styles.resultsCard}>
                {results.map((result, index) => (
                  <LabResultRow isDivided={index > 0} key={result.id} result={result} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.footerBar}>
          <CustomButton
            disabled={isDownloadDisabled}
            icon={<DownloadIcon color={Colors[theme].white} size={ICON_SIZE} />}
            label={Strings.LabReportDetailScreen.downloadPdf}
            style={styles.downloadButton}
            onPress={onDownloadPress}
          />
        </View>
      </View>
    </Screen>
  );
}
