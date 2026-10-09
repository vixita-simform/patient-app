import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";

import { AppText, Screen } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { MoreItemRow } from "./components";
import MoreScreenStyles from "./MoreScreenStyles";
import useMoreScreen from "./useMoreScreen";

/**
 * More tab: menu of features and settings.
 * Log Out is hidden until sign-out exists (there is no auth yet).
 * @returns {ReactElement} A React Element.
 */
export default function MoreScreen(): ReactElement {
  const { styles } = useTheme(MoreScreenStyles);
  const { items, onPressItem } = useMoreScreen();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <View style={styles.header}>
          <AppText style={styles.title}>{Strings.MoreScreen.title}</AppText>
          <AppText style={styles.subtitle}>{Strings.MoreScreen.subtitle}</AppText>
        </View>
        {items.map((item) => (
          <MoreItemRow item={item} key={item.id} onPress={onPressItem} />
        ))}
      </ScrollView>
    </Screen>
  );
}
