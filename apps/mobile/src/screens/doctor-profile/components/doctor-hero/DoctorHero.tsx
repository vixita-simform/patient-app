import { type ReactElement } from 'react';
import { Pressable, View } from 'react-native';

import { BackIcon, HeartIcon } from '../../../../assets/icons';
import { CustomText } from '../../../../components';
import { Strings } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import DoctorHeroStyles from './DoctorHeroStyles';
import type { DoctorHeroProps } from './DoctorHeroTypes';

/**
 * Green profile hero: back and favourite buttons, initials avatar, name and qualifications.
 * @param {DoctorHeroProps} props - doctor identity and button handlers.
 * @returns {ReactElement} A React Element.
 */
const DoctorHero = ({
  initials,
  name,
  qualifications,
  isFavourite = false,
  onBackPress,
  onFavouritePress
}: DoctorHeroProps): ReactElement => {
  const { styles, theme } = useTheme(DoctorHeroStyles);

  return (
    <View style={styles.hero}>
      <View style={styles.heroTopRow}>
        <Pressable
          accessibilityLabel={Strings.Common.back}
          accessibilityRole="button"
          style={styles.heroIconButton}
          onPress={onBackPress}
        >
          <BackIcon color={Colors[theme].white} size={scale(20)} />
        </Pressable>
        <Pressable
          accessibilityLabel={Strings.DoctorProfileScreen.favourite}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavourite }}
          style={styles.heroIconButton}
          onPress={onFavouritePress}
        >
          <HeartIcon color={Colors[theme].white} size={scale(20)} />
        </Pressable>
      </View>
      <View style={styles.heroAvatar}>
        <CustomText style={styles.heroAvatarText}>{initials}</CustomText>
      </View>
      <View style={styles.heroNameCol}>
        <CustomText style={styles.heroName}>{name}</CustomText>
        <CustomText style={styles.heroQualification}>{qualifications}</CustomText>
      </View>
    </View>
  );
};

export default DoctorHero;
