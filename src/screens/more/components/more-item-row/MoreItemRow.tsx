import { useCallback, type ReactElement } from "react";
import { View } from "react-native";

import {
  BellIcon,
  CalendarIcon,
  ChecklistIcon,
  ChevronRightIcon,
  DataIcon,
  HelpIcon,
  InvoiceIcon,
  LinkIcon,
  PenIcon,
  ServicesIcon,
  SettingsIcon,
  ShieldIcon,
  TeamIcon,
} from "../../../../assets/icons";
import { AppText, Card } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { scale, theme } from "../../../../theme";
import type { MoreItemIcon } from "../../../../types";
import MoreItemRowStyles from "./MoreItemRowStyles";
import type { MoreItemRowProps } from "./MoreItemRowTypes";

type IconComponent = (props: { size?: number; color?: string }) => ReactElement;

const ICON_SIZE = scale(16);
const CHEVRON_SIZE = scale(13);

const ICONS: Record<MoreItemIcon, IconComponent> = {
  pen: PenIcon,
  shield: ShieldIcon,
  invoice: InvoiceIcon,
  calendar: CalendarIcon,
  checklist: ChecklistIcon,
  team: TeamIcon,
  services: ServicesIcon,
  data: DataIcon,
  link: LinkIcon,
  bell: BellIcon,
  settings: SettingsIcon,
  help: HelpIcon,
};

/**
 * Menu card with icon tile, label, description and trailing chevron.
 * @param {MoreItemRowProps} props - the item and press handler.
 * @returns {ReactElement} A React Element.
 */
const MoreItemRow = ({ item, onPress }: MoreItemRowProps): ReactElement => {
  const { styles } = useTheme(MoreItemRowStyles);
  const Icon = ICONS[item.icon];
  const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);

  return (
    <Card accessibilityLabel={item.label} style={styles.card} onPress={handlePress}>
      <View style={styles.row}>
        <View style={styles.iconTile}>
          <Icon color={theme.colors.primary} size={ICON_SIZE} />
        </View>
        <View style={styles.textCol}>
          <AppText numberOfLines={1} style={styles.label}>
            {item.label}
          </AppText>
          <AppText numberOfLines={1} style={styles.desc}>
            {item.desc}
          </AppText>
        </View>
        <ChevronRightIcon color={theme.colors.textSecondary} size={CHEVRON_SIZE} />
      </View>
    </Card>
  );
};

export default MoreItemRow;
