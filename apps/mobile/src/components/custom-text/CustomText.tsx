import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Fonts } from '../../theme';
import type { CustomTextType } from './CustomTextTypes';

/** Caps Dynamic Type growth so large accessibility sizes stay readable without breaking layouts. */
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

/**
 * Text with the Figtree font family applied by default and font scaling capped.
 * Automatically applies Figtree Regular unless a fontFamily is explicitly specified in the style prop.
 * Callers can override `maxFontSizeMultiplier` / `allowFontScaling` through props.
 * @param {CustomTextType} props - the props for the custom text component.
 * @returns {ReactElement} A React Element.
 */
const CustomText = ({ style, ...props }: CustomTextType): ReactElement => {
  // Process style to ensure Figtree font is applied if no fontFamily is specified
  const processedStyle = useMemo(() => {
    const flattenedStyle = StyleSheet.flatten(style);

    // If no font family is specified, apply Figtree Regular as default
    if (!flattenedStyle?.fontFamily) {
      return StyleSheet.flatten([flattenedStyle, { fontFamily: Fonts.family.regular }]);
    }

    return flattenedStyle;
  }, [style]);

  return (
    <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} {...props} style={processedStyle} />
  );
};

export default CustomText;
