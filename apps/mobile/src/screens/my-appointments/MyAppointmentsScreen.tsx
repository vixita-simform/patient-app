import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { PlusIcon } from '../../assets/icons';
import { CustomText, IconButton, Screen, ScreenHeader, SegmentedTabs } from '../../components';
import { ICON_BUTTON_VARIANT, SCREEN_HEADER_VARIANT, Strings } from '../../constants';
import { useTheme } from '../../hooks';
import { Colors, scale } from '../../theme';
import { AppointmentCard } from './components';
import type { AppointmentListItem } from './MyAppointmentsScreenTypes';
import MyAppointmentsScreenStyles from './MyAppointmentsScreenStyles';
import useMyAppointmentsScreen from './useMyAppointmentsScreen';

const renderItem: ListRenderItem<AppointmentListItem> = ({ item }) => <AppointmentCard {...item} />;

const keyExtractor = (item: AppointmentListItem): string => item.id;

/**
 * My Appointments: header with an add-appointment button, a 3-segment tab
 * control (Upcoming/Completed/Cancelled) and the appointment list for the
 * active tab. Loading -> error -> empty -> content, with frozen dummy data
 * standing in for the request.
 * @returns {ReactElement} A React Element.
 */
export default function MyAppointmentsScreen(): ReactElement {
  const { styles, theme } = useTheme(MyAppointmentsScreenStyles);
  const { tabs, activeTab, listData, isLoading, isError, onTabPress, onPressAdd } =
    useMyAppointmentsScreen();

  const listHeader = (
    <View style={styles.listHeader}>
      <SegmentedTabs activeId={activeTab} items={tabs} onPress={onTabPress} />
    </View>
  );

  // Loading -> error -> empty are rendered in place of the rows.
  const listEmpty = isLoading ? (
    <ActivityIndicator color={Colors[theme].green} />
  ) : (
    <CustomText style={styles.stateText}>
      {isError ? Strings.Common.somethingWentWrong : Strings.MyAppointmentsScreen.emptyMessage}
    </CustomText>
  );

  return (
    <Screen>
      <View style={styles.screen}>
        <ScreenHeader
          right={
            <IconButton
              accessibilityLabel={Strings.MyAppointmentsScreen.addAppointment}
              variant={ICON_BUTTON_VARIANT.fill}
              onPress={onPressAdd}
            >
              <PlusIcon color={Colors[theme].white} size={scale(20)} />
            </IconButton>
          }
          title={Strings.MyAppointmentsScreen.title}
          variant={SCREEN_HEADER_VARIANT.large}
        />
        <FlatList
          contentContainerStyle={styles.bodyContent}
          data={listData}
          keyExtractor={keyExtractor}
          ListEmptyComponent={listEmpty}
          ListHeaderComponent={listHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={styles.body}
        />
      </View>
    </Screen>
  );
}
