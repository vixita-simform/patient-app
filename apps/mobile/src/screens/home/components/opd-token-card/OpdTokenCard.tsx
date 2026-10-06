import type { ReactElement } from "react";
import { View } from "react-native";

import { CustomText, ProgressBar } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import OpdTokenCardStyles from "./OpdTokenCardStyles";
import type { OpdTokenCardProps } from "./OpdTokenCardTypes";

/**
 * Navy card showing the patient's OPD token, the token being served and queue progress.
 * @param {OpdTokenCardProps} props - token data.
 * @returns {ReactElement} A React Element.
 */
const OpdTokenCard = ({
  department,
  tokenNumber,
  servingNumber,
  patientsAhead,
  waitMinutes,
  progress,
}: OpdTokenCardProps): ReactElement => {
  const { styles } = useTheme(OpdTokenCardStyles);

  return (
    <View style={styles.token}>
      <View style={styles.rowBetween}>
        <View style={styles.colGap4}>
          <CustomText style={styles.tokenLabel}>
            {`${Strings.HomeScreen.yourOpdToken} · ${department}`}
          </CustomText>
          <CustomText style={styles.tokenNumber}>{tokenNumber}</CustomText>
        </View>
        <View style={styles.colGap4End}>
          <CustomText style={styles.tokenLabel}>
            {Strings.HomeScreen.nowServing}
          </CustomText>
          <CustomText style={styles.tokenServing}>{servingNumber}</CustomText>
        </View>
      </View>
      <ProgressBar value={progress} />
      <View style={styles.rowBetween}>
        <CustomText style={styles.tokenLabel}>
          {`${patientsAhead} ${Strings.HomeScreen.patientsAhead}`}
        </CustomText>
        <CustomText style={styles.tokenWait}>
          {`${Strings.HomeScreen.about} ${waitMinutes} ${Strings.HomeScreen.minWait}`}
        </CustomText>
      </View>
    </View>
  );
};

export default OpdTokenCard;
