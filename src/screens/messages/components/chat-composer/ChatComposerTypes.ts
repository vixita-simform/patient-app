export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  attachActive: boolean;
  onPressAttach: () => void;
  onPressSend: () => void;
}
