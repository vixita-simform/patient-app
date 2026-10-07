import type { ReactElement } from 'react';
import { Fragment } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../../../hooks';
import { RecordRow } from '../record-row';
import RecordGroupCardStyles from './RecordGroupCardStyles';
import type { RecordGroupCardProps } from './RecordGroupCardTypes';

/**
 * A month's card: a list of record rows with a divider between each pair.
 * @param {RecordGroupCardProps} props - the group's records.
 * @returns {ReactElement} A React Element.
 */
const RecordGroupCard = ({ records, onRecordPress }: RecordGroupCardProps): ReactElement => {
  const { styles } = useTheme(RecordGroupCardStyles);

  return (
    <View style={styles.card}>
      {records.map((record, index) => (
        <Fragment key={record.id}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <RecordRow record={record} onPress={onRecordPress} />
        </Fragment>
      ))}
    </View>
  );
};

export default RecordGroupCard;
