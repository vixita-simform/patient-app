import type { ReactElement } from "react";

import { CustomText, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import RecordsScreenStyles from "./RecordsScreenStyles";

/**
 * Records tab placeholder until the screen is designed.
 * @returns {ReactElement} A React Element.
 */
export default function RecordsScreen(): ReactElement {
  const { styles } = useTheme(RecordsScreenStyles);

  return (
    <Screen>
      <CustomText style={styles.title}>{Strings.RecordsScreen.title}</CustomText>
    </Screen>
  );
}
