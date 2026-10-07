import { type ReactElement } from 'react';
import { View } from 'react-native';

import { CustomText } from '../../../../components';
import { Strings } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import StatsCardStyles from './StatsCardStyles';
import type { StatsCardProps } from './StatsCardTypes';

/**
 * Three-column strip: experience, patients and rating, split by dividers.
 * @param {StatsCardProps} props - the three stat values.
 * @returns {ReactElement} A React Element.
 */
const StatsCard = ({ experience, patients, rating }: StatsCardProps): ReactElement => {
  const { styles } = useTheme(StatsCardStyles);

  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <CustomText style={styles.statValue}>{experience}</CustomText>
        <CustomText style={styles.textXs}>{Strings.DoctorProfileScreen.experience}</CustomText>
      </View>
      <View style={[styles.stat, styles.statDivider]}>
        <CustomText style={styles.statValue}>{patients}</CustomText>
        <CustomText style={styles.textXs}>{Strings.DoctorProfileScreen.patients}</CustomText>
      </View>
      <View style={[styles.stat, styles.statDivider]}>
        <CustomText style={styles.statValue}>{rating}</CustomText>
        <CustomText style={styles.textXs}>{Strings.DoctorProfileScreen.rating}</CustomText>
      </View>
    </View>
  );
};

export default StatsCard;
