import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { CustomText } from '../../../src/components';
import { Fonts } from '../../../src/theme';
import { RenderWrapper } from '../../Wrapper';

const styles = StyleSheet.create({
  explicitFont: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.f16 },
  sizeOnly: { fontSize: Fonts.size.f14 }
});

describe('CustomText', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<CustomText>Hello</CustomText>);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('injects the default Figtree font family when none is given', async () => {
    await RenderWrapper(<CustomText style={styles.sizeOnly}>Hello</CustomText>);
    expect(screen.getByText('Hello')).toHaveStyle({
      fontFamily: Fonts.family.regular,
      fontSize: Fonts.size.f14
    });
  });

  it('injects the default font family when no style is given', async () => {
    await RenderWrapper(<CustomText>Hello</CustomText>);
    expect(screen.getByText('Hello')).toHaveStyle({ fontFamily: Fonts.family.regular });
  });

  it('keeps an explicit font family', async () => {
    await RenderWrapper(<CustomText style={styles.explicitFont}>Hello</CustomText>);
    expect(screen.getByText('Hello')).toHaveStyle({ fontFamily: Fonts.family.bold });
  });

  it('caps font scaling by default and lets callers override it', async () => {
    await RenderWrapper(<CustomText>Capped</CustomText>);
    expect(screen.getByText('Capped')).toHaveProp('maxFontSizeMultiplier', 1.3);
    await RenderWrapper(<CustomText maxFontSizeMultiplier={2}>Override</CustomText>);
    expect(screen.getByText('Override')).toHaveProp('maxFontSizeMultiplier', 2);
  });
});
