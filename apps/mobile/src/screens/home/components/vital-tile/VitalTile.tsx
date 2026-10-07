import type { ReactElement } from 'react';
import { View } from 'react-native';

import { CustomText } from '../../../../components';
import { useTheme } from '../../../../hooks';
import { Colors, scale } from '../../../../theme';
import VitalTileStyles from './VitalTileStyles';
import type { VitalTileProps } from './VitalTileTypes';

/**
 * Compact vital-sign tile: tinted icon, value with optional unit, and label.
 * @param {VitalTileProps} props - vital data.
 * @returns {ReactElement} A React Element.
 */
const VitalTile = ({ Icon, tone, value, unit, label }: VitalTileProps): ReactElement => {
  const { styles, theme } = useTheme(VitalTileStyles);

  return (
    <View style={styles.vital}>
      <Icon color={Colors[theme][tone]} size={scale(20)} />
      <View style={styles.vitalValueRow}>
        <CustomText style={styles.vitalValue}>{value}</CustomText>
        {unit ? <CustomText style={styles.vitalUnit}>{unit}</CustomText> : null}
      </View>
      <CustomText style={styles.textXs}>{label}</CustomText>
    </View>
  );
};

export default VitalTile;
