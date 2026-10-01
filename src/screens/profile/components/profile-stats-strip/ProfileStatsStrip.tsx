import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import ProfileStatsStripStyles from "./ProfileStatsStripStyles";
import type { ProfileStatsStripProps } from "./ProfileStatsStripTypes";

/**
 * Equal-width stat cells (value over label) separated by vertical hairlines.
 * @param {ProfileStatsStripProps} props - the stats to render.
 * @returns {ReactElement} A React Element.
 */
const ProfileStatsStrip = ({ stats }: ProfileStatsStripProps): ReactElement => {
  const { styles } = useTheme(ProfileStatsStripStyles);

  return (
    <View style={styles.stats}>
      {stats.map((stat, index) => (
        <View key={stat.id} style={StyleSheet.flatten([styles.stat, index > 0 && styles.statDivider])}>
          <CustomText style={styles.statValue}>{stat.value}</CustomText>
          <CustomText style={styles.tXs}>{stat.label}</CustomText>
        </View>
      ))}
    </View>
  );
};

export default ProfileStatsStrip;
