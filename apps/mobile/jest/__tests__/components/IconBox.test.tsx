import { screen } from '@testing-library/react-native';

import { PillIcon } from '../../../src/assets/icons';
import { IconBox } from '../../../src/components';
import { ICON_TONE } from '../../../src/constants';
import { RenderWrapper } from '../../Wrapper';

describe('IconBox', () => {
  it.each(Object.values(ICON_TONE))('matches the snapshot for the %s tone', async (tone) => {
    await RenderWrapper(<IconBox Icon={PillIcon} tone={tone} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
