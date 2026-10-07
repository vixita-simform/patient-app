import type { ReactElement } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../hooks';
import { CustomText } from '../custom-text';
import FormFieldStyles from './FormFieldStyles';
import type { FormFieldProps } from './FormFieldTypes';

/**
 * Label above a form control, with an optional error message below it.
 * @param {FormFieldProps} props - label, control and error.
 * @returns {ReactElement} A React Element.
 */
const FormField = ({ label, children, error }: FormFieldProps): ReactElement => {
  const { styles } = useTheme(FormFieldStyles);

  return (
    <View style={styles.field}>
      <CustomText style={styles.fieldLabel}>{label}</CustomText>
      {children}
      {error ? (
        <CustomText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={styles.errorText}
        >
          {error}
        </CustomText>
      ) : null}
    </View>
  );
};

export default FormField;
