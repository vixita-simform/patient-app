import type { ReactElement } from "react";
import { View } from "react-native";

import { EditIcon } from "../../../../assets/icons";
import { CustomText, IconButton } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { Colors, scale } from "../../../../theme";
import ProfileIdentityCardStyles from "./ProfileIdentityCardStyles";
import type { ProfileIdentityCardProps } from "./ProfileIdentityCardTypes";

/**
 * Card with the patient's initials avatar, name, UHID, phone and an edit button.
 * @param {ProfileIdentityCardProps} props - identity fields and edit handler.
 * @returns {ReactElement} A React Element.
 */
const ProfileIdentityCard = ({
  initials,
  name,
  uhid,
  phone,
  onEditPress,
}: ProfileIdentityCardProps): ReactElement => {
  const { styles, theme } = useTheme(ProfileIdentityCardStyles);

  return (
    <View style={styles.card}>
      <View style={styles.avatarLg}>
        <CustomText style={styles.avatarText}>{initials}</CustomText>
      </View>
      <View style={styles.col}>
        <CustomText style={styles.profileName}>{name}</CustomText>
        <CustomText style={styles.tSub}>{`${Strings.ProfileScreen.uhidPrefix}${uhid}`}</CustomText>
        <CustomText style={styles.tSub}>{phone}</CustomText>
      </View>
      <IconButton accessibilityLabel={Strings.ProfileScreen.editProfile} onPress={onEditPress}>
        <EditIcon color={Colors[theme].navy} size={scale(20)} />
      </IconButton>
    </View>
  );
};

export default ProfileIdentityCard;
