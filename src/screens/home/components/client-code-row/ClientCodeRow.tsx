import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { CheckIcon } from "../../../../assets/icons";
import { AppText } from "../../../../components";
import { Strings } from "../../../../constants";
import { useTheme } from "../../../../hooks";
import { scale, themes } from "../../../../theme";
import ClientCodeRowStyles from "./ClientCodeRowStyles";
import type { ClientCodeRowProps } from "./ClientCodeRowTypes";

const CHECK_SIZE = scale(16);
const CHECK_STROKE = 3;

/**
 * Selectable client code row for the switch-client sheet.
 * @param {ClientCodeRowProps} props - client, active flag and select handler.
 * @returns {ReactElement} A React Element.
 */
const ClientCodeRow = ({ client, active, onSelect }: ClientCodeRowProps): ReactElement => {
  const { styles, theme } = useTheme(ClientCodeRowStyles);
  const onPress = useCallback(() => onSelect(client), [client, onSelect]);

  return (
    <Pressable
      accessibilityLabel={`${client.code}${Strings.Common.listSeparator}${client.name}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.row, active && styles.rowActive]}
      onPress={onPress}>
      <View>
        <AppText style={styles.code}>{client.code}</AppText>
        <AppText style={styles.name}>{client.name}</AppText>
      </View>
      {active ? (
        <CheckIcon
          color={themes[theme].colors.primary}
          size={CHECK_SIZE}
          strokeWidth={CHECK_STROKE}
        />
      ) : null}
    </Pressable>
  );
};

export default ClientCodeRow;
