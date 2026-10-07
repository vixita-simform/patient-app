import type { ReactElement } from 'react';
import { ScrollView, View } from 'react-native';

import {
  ActivityIcon,
  BellIcon,
  CalendarIcon,
  DropIcon,
  FlaskIcon,
  HeartIcon,
  PhoneIcon,
  PillIcon
} from '../../assets/icons';
import { Avatar, CustomText, IconButton, Screen, SectionHeader } from '../../components';
import {
  AVATAR_SIZE,
  AVATAR_TONE,
  QUICK_ACTION_VARIANT,
  Strings,
  VITAL_TONE
} from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import { AppointmentCard, OpdTokenCard, QuickActionTile, VitalTile } from './components';
import HomeScreenStyles from './HomeScreenStyles';
import useHomeScreen from './useHomeScreen';

/**
 * Home dashboard: header, OPD token, quick actions, next appointment and latest vitals.
 * @returns {ReactElement} A React Element.
 */
export default function HomeScreen(): ReactElement {
  const { styles, theme } = useTheme(HomeScreenStyles);
  const {
    data,
    onPressBell,
    onPressBookVisit,
    onPressLabReports,
    onPressMedicines,
    onPressCallAmbulance,
    onPressSeeAll,
    onPressHistory,
    onPressAppointment
  } = useHomeScreen();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.rowGap12}>
          <Avatar
            initials={data.user.initials}
            size={AVATAR_SIZE.compact}
            tone={AVATAR_TONE.navy}
          />
          <View style={styles.col}>
            <CustomText style={styles.textXs}>{Strings.HomeScreen.goodMorning}</CustomText>
            <CustomText style={styles.greetingName}>{data.user.name}</CustomText>
          </View>
        </View>
        <IconButton accessibilityLabel={Strings.Common.notifications} onPress={onPressBell}>
          <BellIcon color={Colors[theme].navy} size={scale(20)} />
        </IconButton>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {data.token ? <OpdTokenCard {...data.token} /> : null}
        <View style={styles.quick}>
          <QuickActionTile
            Icon={CalendarIcon}
            label={Strings.HomeScreen.bookVisit}
            variant={QUICK_ACTION_VARIANT.green}
            onPress={onPressBookVisit}
          />
          <QuickActionTile
            Icon={FlaskIcon}
            label={Strings.Common.labReports}
            variant={QUICK_ACTION_VARIANT.blue}
            onPress={onPressLabReports}
          />
          <QuickActionTile
            Icon={PillIcon}
            label={Strings.HomeScreen.medicines}
            variant={QUICK_ACTION_VARIANT.amber}
            onPress={onPressMedicines}
          />
          <QuickActionTile
            Icon={PhoneIcon}
            label={Strings.HomeScreen.callAmbulance}
            variant={QUICK_ACTION_VARIANT.emergency}
            onPress={onPressCallAmbulance}
          />
        </View>
        <SectionHeader
          actionLabel={Strings.HomeScreen.seeAll}
          title={Strings.HomeScreen.nextAppointment}
          onActionPress={onPressSeeAll}
        />
        {data.appointment ? (
          <AppointmentCard {...data.appointment} onPress={onPressAppointment} />
        ) : null}
        <SectionHeader
          actionLabel={Strings.HomeScreen.history}
          title={Strings.HomeScreen.latestVitals}
          onActionPress={onPressHistory}
        />
        <View style={styles.vitals}>
          <VitalTile
            Icon={HeartIcon}
            label={Strings.HomeScreen.heartRate}
            tone={VITAL_TONE.coral}
            {...data.vitals.heart}
          />
          <VitalTile
            Icon={ActivityIcon}
            label={Strings.HomeScreen.bloodPressure}
            tone={VITAL_TONE.blue}
            {...data.vitals.bloodPressure}
          />
          <VitalTile
            Icon={DropIcon}
            label={Strings.HomeScreen.sugar}
            tone={VITAL_TONE.amber}
            {...data.vitals.sugar}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
