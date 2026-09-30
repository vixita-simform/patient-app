import type { ReactElement } from "react";

import { CustomText, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import ProfileScreenStyles from "./ProfileScreenStyles";

/**
 * Profile tab placeholder until the screen is designed.
 * @returns {ReactElement} A React Element.
 */
export default function ProfileScreen(): ReactElement {
  const { styles } = useTheme(ProfileScreenStyles);

  return (
    <Screen>
      <CustomText style={styles.title}>{Strings.ProfileScreen.title}</CustomText>
    </Screen>
  );
}
