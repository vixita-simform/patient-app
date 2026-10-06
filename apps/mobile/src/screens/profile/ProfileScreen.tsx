import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import { LogoutIcon, SettingsIcon } from "../../assets/icons";
import { CustomButton, IconButton, Screen, ScreenHeader } from "../../components";
import { SCREEN_HEADER_VARIANT, Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { ProfileIdentityCard, ProfileMenuRow, ProfileStatsStrip } from "./components";
import ProfileScreenStyles from "./ProfileScreenStyles";
import useProfileScreen from "./useProfileScreen";

/**
 * Profile tab: header with settings button, identity card, vitals strip,
 * grouped menu card and a soft-destructive Log out button. Static data
 * stands in for the API; see `useProfileScreen`.
 * @returns {ReactElement} A React Element.
 */
export default function ProfileScreen(): ReactElement {
  const { styles, theme } = useTheme(ProfileScreenStyles);
  const { profile, stats, menuItems, onSettingsPress, onEditPress, onMenuItemPress, onLogoutPress } =
    useProfileScreen();

  return (
    <Screen>
      <View style={styles.screen}>
        <ScreenHeader
          right={
            <IconButton
              accessibilityLabel={Strings.ProfileScreen.settings}
              disabled={!onSettingsPress}
              onPress={onSettingsPress}
            >
              <SettingsIcon color={Colors[theme].navy} size={scale(20)} />
            </IconButton>
          }
          title={Strings.ProfileScreen.title}
          variant={SCREEN_HEADER_VARIANT.large}
        />
        <ScrollView
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          <ProfileIdentityCard
            initials={profile.initials}
            name={profile.name}
            phone={profile.phone}
            uhid={profile.uhid}
            onEditPress={onEditPress}
          />
          <ProfileStatsStrip stats={stats} />
          <View style={styles.groupCard}>
            {menuItems.map((item, index) => (
              <ProfileMenuRow
                badge={item.badge}
                Icon={item.Icon}
                id={item.id}
                isDivided={index > 0}
                isEnabled={item.isEnabled}
                key={item.id}
                title={item.title}
                tone={item.tone}
                onPress={onMenuItemPress}
              />
            ))}
          </View>
          <CustomButton
            icon={<LogoutIcon color={Colors[theme].coral} size={scale(20)} />}
            label={Strings.ProfileScreen.logOut}
            style={styles.logoutBtn}
            textStyle={styles.logoutText}
            onPress={onLogoutPress}
          />
        </ScrollView>
      </View>
    </Screen>
  );
}
