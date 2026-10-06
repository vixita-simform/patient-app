export interface EditableAvatarProps {
  initials: string;
  accessibilityLabel: string;
  /** Omitted until a photo picker exists; the pen button then renders disabled. */
  onPress?: () => void;
}
