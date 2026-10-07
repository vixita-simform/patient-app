import { StyleSheet } from 'react-native';

import { Colors, Fonts, scale, type ThemeMode } from '../../theme';

const styles = (theme: ThemeMode) =>
  StyleSheet.create({
    screen: {
      flex: 1
    },
    body: {
      flex: 1
    },
    bodyContent: {
      paddingTop: scale(4),
      paddingRight: scale(20),
      paddingBottom: scale(24),
      paddingLeft: scale(20),
      gap: scale(18)
    },
    listHeader: {
      flexDirection: 'column',
      gap: scale(18)
    },
    search: {
      height: scale(48),
      flexDirection: 'row',
      backgroundColor: Colors[theme].card,
      borderWidth: scale(1),
      borderColor: Colors[theme].line,
      alignItems: 'center',
      gap: scale(10),
      paddingVertical: 0,
      paddingHorizontal: scale(14),
      borderRadius: scale(14)
    },
    searchText: {
      flex: 1,
      height: '100%',
      paddingVertical: 0,
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14,
      color: Colors[theme].navy
    },
    hScroll: {
      marginVertical: 0,
      marginHorizontal: scale(-20)
    },
    hScrollContent: {
      flexDirection: 'row',
      gap: scale(8),
      paddingVertical: 0,
      paddingHorizontal: scale(20)
    },
    countText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted
    },
    stateText: {
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.h4,
      color: Colors[theme].muted,
      textAlign: 'center'
    }
  });

export default styles;
