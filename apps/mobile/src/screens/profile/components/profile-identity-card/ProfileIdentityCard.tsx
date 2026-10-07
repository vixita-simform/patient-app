import type { ReactElement } from 'react';
import { View } from 'react-native';

import { EditIcon } from '../../../../assets/icons';
import { Avatar, CustomText, IconButton } from '../../../../components';
import { AVATAR_SIZE, AVATAR_TONE, Strings } from '../../../../constants';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import ProfileIdentityCardStyles from './ProfileIdentityCardStyles';
import type { ProfileIdentityCardProps } from './ProfileIdentityCardTypes';

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
  onEditPress
}: ProfileIdentityCardProps): ReactElement => {
  const { styles, theme } = useTheme(ProfileIdentityCardStyles);

  return (
    <View style={styles.card}>
      <Avatar initials={initials} size={AVATAR_SIZE.large} tone={AVATAR_TONE.navy} />
      <View style={styles.col}>
        <CustomText style={styles.profileName}>{name}</CustomText>
        {uhid ? (
          <CustomText
            style={styles.tSub}
          >{`${Strings.ProfileScreen.uhidPrefix}${uhid}`}</CustomText>
        ) : null}
        <CustomText style={styles.tSub}>{phone}</CustomText>
      </View>
      <IconButton
        accessibilityLabel={Strings.ProfileScreen.editProfile}
        disabled={!onEditPress}
        onPress={onEditPress}
      >
        <EditIcon color={Colors[theme].navy} size={scale(20)} />
      </IconButton>
    </View>
  );
};

export default ProfileIdentityCard;
