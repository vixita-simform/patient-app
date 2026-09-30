import type { StyleProp, TextProps, TextStyle } from "react-native";

export interface CustomTextType extends TextProps {
  style?: StyleProp<TextStyle>;
}
