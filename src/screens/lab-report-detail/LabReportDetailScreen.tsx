import type { ReactElement } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AlertIcon, BackIcon, DownloadIcon, ShareIcon } from "../../assets/icons";
import { CustomText, IconButton, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { LabResultRow } from "./components";
import LabReportDetailScreenStyles from "./LabReportDetailScreenStyles";
import useLabReportDetailScreen from "./useLabReportDetailScreen";

/**
 * Lab Report Detail: fixed header (back/title/share), a scrolling body of a
 * meta card, a conditional out-of-range alert card and the results card, and
 * a sticky footer "Download PDF" button. Static dummy data stands in for the
 * API — see `useLabReportDetailScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function LabReportDetailScreen(): ReactElement {
  const { styles, theme } = useTheme(LabReportDetailScreenStyles);
  const { report, results, showAlert, onBackPress, onSharePress, onDownloadPress } =
    useLabReportDetailScreen();

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <IconButton accessibilityLabel={Strings.Common.back} onPress={onBackPress}>
            <BackIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
          <CustomText style={styles.headerTitle}>
            {Strings.LabReportDetailScreen.title}
          </CustomText>
          <IconButton accessibilityLabel={Strings.LabReportDetailScreen.share} onPress={onSharePress}>
            <ShareIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
        </View>
        <ScrollView
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          {!report ? (
            <CustomText style={styles.headerTitle}>
              {Strings.LabReportDetailScreen.notFound}
            </CustomText>
          ) : (
            <>
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <CustomText style={styles.tSub}>
                    {Strings.LabReportDetailScreen.sampleCollected}
                  </CustomText>
                  <CustomText style={styles.metaValue}>{report.sampleCollectedAt}</CustomText>
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
                    <AlertIcon color={Colors[theme].coral} size={scale(20)} />
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
          <Pressable
            accessibilityLabel={Strings.LabReportDetailScreen.downloadPdf}
            accessibilityRole="button"
            style={styles.btnPrimary}
            onPress={onDownloadPress}
          >
            <DownloadIcon color={Colors[theme].white} size={scale(20)} />
            <CustomText style={styles.btnPrimaryText}>
              {Strings.LabReportDetailScreen.downloadPdf}
            </CustomText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
