import type { ReactElement } from "react";
import { View } from "react-native";

import { AppText, Avatar } from "../../../../components";
import { useTheme } from "../../../../hooks";
import { themes, type ColorKey } from "../../../../theme";
import type { TeamRole } from "../../../../types";
import TeamMemberTileStyles from "./TeamMemberTileStyles";
import type { TeamMemberTileProps } from "./TeamMemberTileTypes";

const AVATAR_SIZE = 44;

/** Avatar gradient colour per team role; roles without a brand colour use accent. */
const ROLE_COLOR_KEY: Readonly<Record<TeamRole, ColorKey>> = Object.freeze({
  Accountant: "primary",
  "Tax Advisor": "teal",
  Payroll: "petrol",
  "Financial Advisor": "accent",
});

/**
 * Team member avatar with first name and role.
 * @param {TeamMemberTileProps} props - the member to show.
 * @returns {ReactElement} A React Element.
 */
const TeamMemberTile = ({ member }: TeamMemberTileProps): ReactElement => {
  const { styles, theme } = useTheme(TeamMemberTileStyles);
  const { colors } = themes[theme];
  const firstName = member.name.trim().split(/\s+/)[0];

  return (
    <View style={styles.tile}>
      <Avatar
        color={colors[ROLE_COLOR_KEY[member.role] ?? "accent"]}
        initials={member.img}
        size={AVATAR_SIZE}
      />
      <AppText numberOfLines={1} style={styles.name}>
        {firstName}
      </AppText>
      <AppText numberOfLines={1} style={styles.role}>
        {member.role}
      </AppText>
    </View>
  );
};

export default TeamMemberTile;
