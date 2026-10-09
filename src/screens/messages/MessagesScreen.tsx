import type { ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { AppText, Screen } from "../../components";
import { RECIPIENTS, SAMPLE_ATTACHMENT, Strings } from "../../constants";
import { useTheme } from "../../hooks";
import {
  AttachDocumentSheet,
  ChatBubble,
  ChatComposer,
  ThreadCard,
  ThreadHeader,
} from "./components";
import MessagesScreenStyles from "./MessagesScreenStyles";
import useMessagesScreen from "./useMessagesScreen";

/**
 * Messages tab: thread list and, when one is selected, the chat view.
 * @returns {ReactElement} A React Element.
 */
export default function MessagesScreen(): ReactElement {
  const { styles } = useTheme(MessagesScreenStyles);
  const {
    threads,
    selectedThread,
    isGroup,
    threadMessages,
    message,
    attachOpen,
    attachStep,
    attachRecipients,
    listRef,
    onSelectThread,
    onCloseThread,
    onChangeMessage,
    onToggleAttach,
    onCloseAttach,
    onPickSource,
    onBackToSource,
    onChangeRecipients,
    onSendAttachment,
    onPressSend,
    onContentSizeChange,
  } = useMessagesScreen();

  if (!selectedThread) {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={styles.listContent}
          style={styles.listContainer}
        >
          <View style={styles.header}>
            <AppText style={styles.title}>{Strings.MessagesScreen.title}</AppText>
            <AppText style={styles.subtitle}>
              {Strings.MessagesScreen.subtitle}
            </AppText>
          </View>
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onPress={() => onSelectThread(thread.id)}
            />
          ))}
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior="padding" style={styles.thread}>
        <ThreadHeader thread={selectedThread} onBack={onCloseThread} />
        <ScrollView
          contentContainerStyle={styles.messageListContent}
          ref={listRef}
          style={styles.messageList}
          onContentSizeChange={onContentSizeChange}
        >
          {threadMessages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              recipients={RECIPIENTS}
              showSender={isGroup && m.staff}
            />
          ))}
        </ScrollView>
        {selectedThread.closed ? (
          <View style={styles.closedFooter}>
            <View style={styles.closedNotice}>
              <AppText style={styles.closedNoticeTitle}>
                {`${Strings.MessagesScreen.closedBy} ${selectedThread.closedDate}`}
              </AppText>
              <AppText style={styles.closedNoticeBody}>
                {Strings.MessagesScreen.viewOnly}
              </AppText>
            </View>
          </View>
        ) : (
          <ChatComposer
            attachActive={attachOpen}
            value={message}
            onChangeText={onChangeMessage}
            onPressAttach={onToggleAttach}
            onPressSend={onPressSend}
          />
        )}
      </KeyboardAvoidingView>
      <AttachDocumentSheet
        attachment={SAMPLE_ATTACHMENT}
        recipients={RECIPIENTS}
        selected={attachRecipients}
        step={attachStep}
        visible={attachOpen && !selectedThread.closed}
        onBack={onBackToSource}
        onChangeSelected={onChangeRecipients}
        onClose={onCloseAttach}
        onPickSource={onPickSource}
        onSend={onSendAttachment}
      />
    </Screen>
  );
}
