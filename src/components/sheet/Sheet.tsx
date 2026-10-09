import type { ReactElement } from "react";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { CustomText } from "../custom-text";
import SheetStyles from "./SheetStyles";
import type { SheetProps } from "./SheetTypes";

/**
 * Bottom sheet in a transparent slide-up Modal; the backdrop closes it.
 * @param {SheetProps} props - visibility, close handler, optional title and content.
 * @returns {ReactElement} A React Element.
 */
const Sheet = ({ visible, onClose, title, children }: SheetProps): ReactElement => {
  const { styles } = useTheme(SheetStyles);
  const { bottom } = useSafeAreaInsets();
  const panelStyle = useMemo(
    () => [styles.panel, { paddingBottom: (styles.panel.paddingBottom as number) + bottom }],
    [styles.panel, bottom],
  );

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel={Strings.Common.close}
          accessibilityRole="button"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={panelStyle}>
          <View style={styles.handle} />
          {title ? <CustomText style={styles.title}>{title}</CustomText> : null}
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default Sheet;
