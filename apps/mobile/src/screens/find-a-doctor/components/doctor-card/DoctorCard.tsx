import { type ReactElement, useCallback } from "react";
import { Pressable, View } from "react-native";

import { StarIcon } from "../../../../assets/icons";
import { Avatar, CustomText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import DoctorCardStyles from "./DoctorCardStyles";
import type { DoctorCardProps } from "./DoctorCardTypes";

/**
 * Doctor list card: avatar, name, specialty, rating and next slot with a Book button.
 * The card body and the Book button are sibling pressables, so screen readers reach both.
 * @param {DoctorCardProps} props - doctor details and press handlers.
 * @returns {ReactElement} A React Element.
 */
const DoctorCard = ({
  id,
  initials,
  tone,
  name,
  specialtyLabel,
  experienceYears,
  rating,
  reviewCount,
  nextSlot,
  availableToday,
  onPress,
  onBookPress,
}: DoctorCardProps): ReactElement => {
  const { styles, theme } = useTheme(DoctorCardStyles);
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  const handleBookPress = useCallback(() => onBookPress(id), [id, onBookPress]);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityLabel={name}
        accessibilityRole="button"
        style={styles.pressArea}
        onPress={handlePress}
      >
        <View style={styles.topRow}>
          <Avatar initials={initials} tone={tone} />
          <View style={styles.info}>
            <CustomText style={styles.title}>{name}</CustomText>
            <CustomText style={styles.sub}>
              {`${specialtyLabel} · ${experienceYears} ${Strings.DoctorCard.yrsExp}`}
            </CustomText>
            <View style={styles.rating}>
              <StarIcon color={Colors[theme].amber} size={scale(16)} />
              <CustomText style={styles.ratingValue}>{rating}</CustomText>
              <CustomText style={styles.xs}>
                {`(${reviewCount} ${Strings.DoctorCard.reviews})`}
              </CustomText>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
      </Pressable>
      <View style={styles.footerRow}>
        <Pressable
          accessibilityLabel={`${Strings.DoctorCard.nextAvailable} ${nextSlot}`}
          accessibilityRole="button"
          style={styles.slotColumn}
          onPress={handlePress}
        >
          <CustomText style={styles.xs}>{Strings.DoctorCard.nextAvailable}</CustomText>
          <CustomText style={styles.nextSlot}>{nextSlot}</CustomText>
        </Pressable>
        <Pressable
          accessibilityLabel={Strings.DoctorCard.book}
          accessibilityRole="button"
          style={availableToday ? styles.btnPrimary : styles.btnOutline}
          onPress={handleBookPress}
        >
          <CustomText
            style={availableToday ? styles.btnTextPrimary : styles.btnTextOutline}
          >
            {Strings.DoctorCard.book}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default DoctorCard;
