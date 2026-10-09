import type { ReactElement } from "react";

import { AppText, Card, Screen, SubScreen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import FeatureScreenStyles from "./FeatureScreenStyles";
import useFeatureScreen from "./useFeatureScreen";

/**
 * Stack screen for More-menu features that are not built yet: title from the menu item, "coming soon" body.
 * @returns {ReactElement} A React Element.
 */
export default function FeatureScreen(): ReactElement {
  const { styles } = useTheme(FeatureScreenStyles);
  const { item, onBack } = useFeatureScreen();

  return (
    <Screen>
      <SubScreen
        subtitle={item?.desc ?? ""}
        title={item?.label ?? Strings.FeatureScreen.comingSoon}
        onBack={onBack}
      >
        <Card style={styles.body}>
          <AppText style={styles.heading}>{Strings.FeatureScreen.comingSoon}</AppText>
          <AppText style={styles.message}>{Strings.FeatureScreen.comingSoonBody}</AppText>
        </Card>
      </SubScreen>
    </Screen>
  );
}
