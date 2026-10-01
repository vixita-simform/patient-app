import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import { BackIcon, PlusIcon } from "../../assets/icons";
import { CustomText, IconButton, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { DoseTimeline, MedicineCard } from "./components";
import MedicinesScreenStyles from "./MedicinesScreenStyles";
import useMedicinesScreen from "./useMedicinesScreen";

/**
 * "My medicines" screen: header, "Today's doses" summary card (4 dose
 * chips), the active prescription's prescriber line, and a card per
 * medicine (icon, name, status badge, dosage, stock bar). Reached by
 * tapping the Prescriptions tile on the Records screen. Static dummy data
 * stands in for the API — see `useMedicinesScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function MedicinesScreen(): ReactElement {
  const { styles, theme } = useTheme(MedicinesScreenStyles);
  const {
    doses,
    dosesTakenLabel,
    prescriberLine,
    medicines,
    onBackPress,
    onAddPress,
    onOrderRefillPress,
  } = useMedicinesScreen();

  return (
    <Screen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <IconButton accessibilityLabel={Strings.Common.back} onPress={onBackPress}>
            <BackIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
          <CustomText style={styles.headerTitle}>{Strings.MedicinesScreen.title}</CustomText>
          <IconButton
            accessibilityLabel={Strings.MedicinesScreen.addMedicine}
            onPress={onAddPress}
          >
            <PlusIcon color={Colors[theme].navy} size={scale(20)} />
          </IconButton>
        </View>
        <ScrollView
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          <View style={styles.card}>
            <View style={styles.dosesHeaderRow}>
              <CustomText style={styles.dosesTitle}>
                {Strings.MedicinesScreen.todaysDoses}
              </CustomText>
              <CustomText style={styles.dosesSubtitle}>{dosesTakenLabel}</CustomText>
            </View>
            <DoseTimeline doses={doses} />
          </View>
          <View style={styles.sectionTitle}>
            <CustomText style={styles.sectionTitleH3}>
              {Strings.MedicinesScreen.activePrescription}
            </CustomText>
            <CustomText style={styles.sectionTitleSub}>{prescriberLine}</CustomText>
          </View>
          <View style={styles.medicineList}>
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onOrderRefillPress={onOrderRefillPress}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
