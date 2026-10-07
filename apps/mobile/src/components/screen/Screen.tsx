import type { ReactElement } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks';
import ScreenStyles from './ScreenStyles';
import type { ScreenProps } from './ScreenTypes';

const TOP_EDGE = Object.freeze(['top'] as const);

/**
 * Screen shell: themed background with the top safe-area inset applied
 * (the tab bar handles the bottom).
 * @param {ScreenProps} props - screen content.
 * @returns {ReactElement} A React Element.
 */
const Screen = ({ children }: ScreenProps): ReactElement => {
  const { styles } = useTheme(ScreenStyles);

  return (
    <SafeAreaView edges={TOP_EDGE} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
};

export default Screen;
