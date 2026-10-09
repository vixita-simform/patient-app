import type { ReactElement } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import {
  CameraIcon,
  ChevronRightIcon,
  FolderIcon,
  ShieldIcon,
} from "../../assets/icons";
import {
  AppText,
  Card,
  RecipientPicker,
  Screen,
  SectionHeader,
} from "../../components";
import { RECIPIENTS, Strings, UPLOAD_DOCUMENT_TYPES } from "../../constants";
import { useTheme } from "../../hooks";
import { Colors, scale } from "../../theme";
import { fillTemplate } from "../../utils";
import {
  DocumentTypePicker,
  UploadedDocCard,
  UploadSourceTile,
  UploadSuccessCard,
} from "./components";
import UploadScreenStyles from "./UploadScreenStyles";
import useUploadScreen from "./useUploadScreen";

const SOURCE_ICON_SIZE = scale(18);
const TYPE_ICON_SIZE = scale(15);
const TYPE_ARROW_SIZE = scale(13);
const SHIELD_ICON_SIZE = scale(14);

/**
 * Upload tab: capture sources, document type, recipients, submit and history.
 * @returns {ReactElement} A React Element.
 */
export default function UploadScreen(): ReactElement {
  const { styles, theme } = useTheme(UploadScreenStyles);
  const {
    picking,
    selectedType,
    uploading,
    done,
    recips,
    isVerification,
    canSubmit,
    visibleDocs,
    remainingCount,
    recipientLabels,
    setRecips,
    onOpenPicker,
    onClosePicker,
    onSelectType,
    onSubmit,
    onReset,
    onLoadMore,
  } = useUploadScreen();
  const strings = Strings.UploadScreen;
  const colors = Colors[theme];
  const loadMoreText = fillTemplate(Strings.Common.loadMoreCount, {
    count: remainingCount,
  });

  const renderForm = (): ReactElement => (
    <>
      <View style={styles.sourceRow}>
        <UploadSourceTile
          icon={<CameraIcon color={colors.primary} size={SOURCE_ICON_SIZE} />}
          label={Strings.Common.takePhoto}
          tone="green"
          onPress={onOpenPicker}
        />
        <UploadSourceTile
          icon={<FolderIcon color={colors.teal} size={SOURCE_ICON_SIZE} />}
          label={Strings.Common.uploadFromStorage}
          tone="teal"
          onPress={onOpenPicker}
        />
      </View>
      <AppText style={styles.fileHint}>{strings.fileHint}</AppText>
      <AppText style={styles.fieldLabel}>{strings.documentTypeLabel}</AppText>
      <Card
        accessibilityLabel={selectedType ?? strings.selectDocumentType}
        style={isVerification ? styles.typeSelectVerif : styles.typeSelect}
        onPress={onOpenPicker}
      >
        <View style={styles.typeSelectRow}>
          <View style={styles.typeIconBox}>
            <FolderIcon color={colors.teal} size={TYPE_ICON_SIZE} />
          </View>
          <View style={styles.typeSelectTextWrap}>
            <AppText
              numberOfLines={1}
              style={[
                styles.typeSelectText,
                !selectedType && styles.typeSelectPlaceholder,
              ]}
            >
              {selectedType ?? strings.selectDocumentType}
            </AppText>
          </View>
          <ChevronRightIcon
            color={colors.textSecondary}
            size={TYPE_ARROW_SIZE}
          />
        </View>
      </Card>
      {isVerification ? (
        <View style={styles.verifNotice}>
          <ShieldIcon color={colors.teal} size={SHIELD_ICON_SIZE} />
          <AppText style={styles.verifNoticeText}>
            {strings.veriffNotice}
          </AppText>
        </View>
      ) : null}
      <AppText style={styles.fieldLabel}>{Strings.Common.whoShouldSee}</AppText>
      <View style={styles.recipientWrap}>
        <RecipientPicker
          recipients={RECIPIENTS}
          value={recips}
          onChange={setRecips}
        />
      </View>
      <Pressable
        accessibilityLabel={strings.submitDocument}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={onSubmit}
      >
        <AppText
          style={[
            styles.submitButtonText,
            !canSubmit && styles.submitButtonTextDisabled,
          ]}
        >
          {strings.submitDocument}
        </AppText>
      </Pressable>
    </>
  );

  const renderUploading = (): ReactElement => (
    <Card style={styles.uploadingCard}>
      <View style={styles.spinnerBox}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
      <AppText style={styles.uploadingTitle}>{strings.uploading}</AppText>
      <AppText style={styles.uploadingSubtitle}>
        {strings.securelySending}
      </AppText>
    </Card>
  );

  const renderMain = (): ReactElement => (
    <>
      <View style={styles.header}>
        <AppText style={styles.title}>{strings.heading}</AppText>
        <AppText style={styles.subtitle}>{strings.subtitle}</AppText>
      </View>
      {done ? (
        <UploadSuccessCard
          recipientLabels={recipientLabels}
          onReset={onReset}
        />
      ) : null}
      {!done && uploading ? renderUploading() : null}
      {!done && !uploading ? renderForm() : null}
      <SectionHeader title={strings.previouslyUploaded} />
      <View style={styles.docList}>
        {visibleDocs.map((doc) => (
          <UploadedDocCard doc={doc} key={doc.id} />
        ))}
      </View>
      {remainingCount > 0 ? (
        <Pressable
          accessibilityLabel={loadMoreText}
          accessibilityRole="button"
          style={styles.loadMoreButton}
          onPress={onLoadMore}
        >
          <AppText style={styles.loadMoreText}>
            {loadMoreText}
          </AppText>
        </Pressable>
      ) : null}
    </>
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        {picking ? (
          <DocumentTypePicker
            selectedType={selectedType}
            types={UPLOAD_DOCUMENT_TYPES}
            onBack={onClosePicker}
            onSelect={onSelectType}
          />
        ) : (
          renderMain()
        )}
      </ScrollView>
    </Screen>
  );
}
