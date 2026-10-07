import { StyleSheet } from 'react-native';

import { scale } from '../../../../theme';

const styles = () =>
  StyleSheet.create({
    // design-drift[flexDirection]: .chips-wrap compiles with no flexDirection (web row default); RN defaults to column, so it is set explicitly here.
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8)
    }
  });

export default styles;
