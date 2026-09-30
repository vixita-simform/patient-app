import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import {
  ActivityIcon,
  BellIcon,
  CalendarIcon,
  DropIcon,
  FlaskIcon,
  HeartIcon,
  PhoneIcon,
  PillIcon,
} from "../../assets/icons";
import {
  Avatar,
  CustomText,
  IconButton,
  Screen,
  SectionHeader,
} from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import {
  AppointmentCard,
  OpdTokenCard,
  QuickActionTile,
  VitalTile,
} from "./components";
import HomeScreenStyles from "./HomeScreenStyles";
import useHomeScreen from "./useHomeScreen";

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
    onPressAppointment,
  } = useHomeScreen();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.rowGap12}>
          <Avatar initials={data.user.initials} size="compact" tone="navy" />
          <View style={styles.col}>
            <CustomText style={styles.textXs}>
              {Strings.HomeScreen.goodMorning}
            </CustomText>
            <CustomText style={styles.greetingName}>
              {data.user.name}
            </CustomText>
          </View>
        </View>
        <IconButton
          accessibilityLabel={Strings.HomeScreen.notifications}
          onPress={onPressBell}
        >
          <BellIcon color={Colors[theme].navy} size={scale(20)} />
        </IconButton>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <OpdTokenCard {...data.token} />
        <View style={styles.quick}>
          <QuickActionTile
            Icon={CalendarIcon}
            label={Strings.HomeScreen.bookVisit}
            variant="green"
            onPress={onPressBookVisit}
          />
          <QuickActionTile
            Icon={FlaskIcon}
            label={Strings.HomeScreen.labReports}
            variant="blue"
            onPress={onPressLabReports}
          />
          <QuickActionTile
            Icon={PillIcon}
            label={Strings.HomeScreen.medicines}
            variant="amber"
            onPress={onPressMedicines}
          />
          <QuickActionTile
            Icon={PhoneIcon}
            label={Strings.HomeScreen.callAmbulance}
            variant="emergency"
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
            tone="coral"
            {...data.vitals.heart}
          />
          <VitalTile
            Icon={ActivityIcon}
            label={Strings.HomeScreen.bloodPressure}
            tone="blue"
            {...data.vitals.bloodPressure}
          />
          <VitalTile
            Icon={DropIcon}
            label={Strings.HomeScreen.sugar}
            tone="amber"
            {...data.vitals.sugar}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
