import type { ReactElement } from "react";
import { View } from "react-native";

import { CustomText } from "../../../../components";
import { useTheme } from "../../../../hooks";
import FormFieldStyles from "./FormFieldStyles";
import type { FormFieldProps } from "./FormFieldTypes";

/**
 * Label above a form control.
 * @param {FormFieldProps} props - label text and the control to render.
 * @returns {ReactElement} A React Element.
 */
const FormField = ({ label, children }: FormFieldProps): ReactElement => {
  const { styles } = useTheme(FormFieldStyles);

  return (
    <View style={styles.field}>
      <CustomText style={styles.fieldLabel}>{label}</CustomText>
      {children}
    </View>
  );
};

export default FormField;
