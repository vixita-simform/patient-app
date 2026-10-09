import type { ReactElement } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  BellIcon,
  ChevronRightIcon,
  PenIcon,
  SwapIcon,
} from "../../assets/icons";
import { AppText, Card, Screen, SectionHeader, Sheet } from "../../components";
import { Strings } from "../../constants";
import { useTheme } from "../../hooks";
import { scale, themes } from "../../theme";
import {
  ClientCodeRow,
  MessagePreviewCard,
  StatCard,
  TeamMemberTile,
} from "./components";
import HomeScreenStyles from "./HomeScreenStyles";
import useHomeScreen from "./useHomeScreen";

const SWAP_ICON_SIZE = scale(16);
const BELL_ICON_SIZE = scale(20);
const PEN_ICON_SIZE = scale(16);
const CHEVRON_SIZE = scale(14);
const ICON_STROKE = 2;

/**
 * Home tab: client header, summary stats, recent documents, messages and team.
 * @returns {ReactElement} A React Element.
 */
export default function HomeScreen(): ReactElement {
  const { styles, theme } = useTheme(HomeScreenStyles);
  const {
    client,
    clientCodes,
    showClientSwitch,
    ccOpen,
    unreadCount,
    recentDocuments,
    recentMessages,
    documentCount,
    summary,
    team,
    onOpenClientSheet,
    onCloseClientSheet,
    onSelectClient,
    onPressNotifications,
    onPressOutstanding,
    onPressDocuments,
    onPressSigning,
    onPressMessages,
    onPressTeam,
  } = useHomeScreen();
  const { colors } = themes[theme];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText style={styles.greeting}>{Strings.HomeScreen.goodMorning}</AppText>
            <AppText numberOfLines={1} style={styles.clientName}>
              {client.name}
            </AppText>
            <AppText numberOfLines={1} style={styles.clientFarm}>
              {client.farm}
            </AppText>
          </View>
          <View style={styles.headerActions}>
            {showClientSwitch ? (
              <Pressable
                accessibilityLabel={Strings.HomeScreen.switchClientCode}
                accessibilityRole="button"
                style={styles.switchButton}
                onPress={onOpenClientSheet}>
                <SwapIcon color={colors.primary} size={SWAP_ICON_SIZE} strokeWidth={ICON_STROKE} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={Strings.HomeScreen.notifications}
              accessibilityRole="button"
              style={styles.bellButton}
              onPress={onPressNotifications}>
              <BellIcon color={colors.text} size={BELL_ICON_SIZE} strokeWidth={ICON_STROKE} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <AppText style={styles.badgeText}>{unreadCount}</AppText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.statGrid}>
          <StatCard
            caption={Strings.HomeScreen.itemsNeedAttention}
            colors={[colors.primary, colors.primaryDark]}
            label={Strings.HomeScreen.outstanding}
            value={summary.outstandingCount}
            onPress={onPressOutstanding}
          />
          <StatCard
            caption={Strings.HomeScreen.availableToView}
            colors={[colors.teal, colors.tealDark]}
            label={Strings.DocumentsScreen.title}
            value={documentCount}
            onPress={onPressDocuments}
          />
        </View>

        <Card style={styles.signatureCard} onPress={onPressSigning}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureIconBox}>
              <PenIcon color={colors.orange} size={PEN_ICON_SIZE} />
            </View>
            <View style={styles.signatureText}>
              <AppText style={styles.signatureTitle}>{Strings.HomeScreen.awaitingSignature}</AppText>
              <AppText style={styles.signatureSubtitle}>
                {`${summary.pendingSignatureCount} ${Strings.HomeScreen.needYourSignature}`}
              </AppText>
            </View>
            <ChevronRightIcon color={colors.textSecondary} size={CHEVRON_SIZE} />
          </View>
        </Card>

        <SectionHeader
          actionLabel={Strings.HomeScreen.viewAll}
          title={Strings.HomeScreen.recentDocuments}
          onActionPress={onPressDocuments}
        />
        <View style={styles.list}>
          {recentDocuments.map((doc) => (
            <Card key={doc.id} style={styles.docCard}>
              <View style={styles.docInfo}>
                <AppText style={styles.docName}>{doc.name}</AppText>
                <AppText style={styles.docMeta}>
                  {`${doc.type}${Strings.Common.metaSeparator}${doc.date}`}
                </AppText>
              </View>
            </Card>
          ))}
        </View>

        <SectionHeader
          actionLabel={Strings.HomeScreen.viewAll}
          title={Strings.MessagesScreen.title}
          onActionPress={onPressMessages}
        />
        <View style={styles.list}>
          {recentMessages.map((message) => (
            <MessagePreviewCard key={message.id} message={message} onPress={onPressMessages} />
          ))}
        </View>

        <SectionHeader
          actionLabel={Strings.HomeScreen.viewAll}
          title={Strings.HomeScreen.yourTeam}
          onActionPress={onPressTeam}
        />
        <ScrollView
          horizontal
          contentContainerStyle={styles.teamRow}
          showsHorizontalScrollIndicator={false}>
          {team.map((member) => (
            <TeamMemberTile key={member.id} member={member} />
          ))}
        </ScrollView>
      </ScrollView>

      <Sheet
        title={Strings.HomeScreen.switchClientCodeTitle}
        visible={ccOpen}
        onClose={onCloseClientSheet}>
        {clientCodes.map((c) => (
          <ClientCodeRow
            active={c.code === client.code}
            client={c}
            key={c.code}
            onSelect={onSelectClient}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
