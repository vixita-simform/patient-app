import React, { type ReactElement } from "react";
import { View } from "react-native";

import { CustomText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import OpdHoursCardStyles from "./OpdHoursCardStyles";
import type { OpdHoursCardProps } from "./OpdHoursCardTypes";

/**
 * Card listing OPD hours per day; a null value renders muted "Closed".
 * @param {OpdHoursCardProps} props - hours rows.
 * @returns {ReactElement} A React Element.
 */
const OpdHoursCard = ({ rows }: OpdHoursCardProps): ReactElement => {
  const { styles } = useTheme(OpdHoursCardStyles);

  return (
    <View style={styles.card}>
      <CustomText style={styles.cardTitle}>{Strings.DoctorProfileScreen.opdHours}</CustomText>
      {rows.map((row, index) => (
        <React.Fragment key={row.id}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.hoursRow}>
            <CustomText style={styles.hoursLabel}>{row.label}</CustomText>
            {row.hours === null ? (
              <CustomText style={styles.textSub}>{Strings.DoctorProfileScreen.closed}</CustomText>
            ) : (
              <CustomText style={styles.hoursValue}>{row.hours}</CustomText>
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

export default OpdHoursCard;
