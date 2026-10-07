import { screen, userEvent } from '@testing-library/react-native';

import { BellIcon } from '../../../src/assets/icons';
import { IconButton } from '../../../src/components';
import { Strings } from '../../../src/constants';
import { RenderWrapper } from '../../Wrapper';

describe('IconButton', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(
      <IconButton accessibilityLabel={Strings.Common.notifications}>
        <BellIcon />
      </IconButton>
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('fires onPress when pressed', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <IconButton accessibilityLabel={Strings.Common.notifications} onPress={onPress}>
        <BellIcon />
      </IconButton>
    );
    await user.press(screen.getByRole('button', { name: Strings.Common.notifications }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and reports disabled when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <IconButton disabled accessibilityLabel={Strings.Common.notifications} onPress={onPress}>
        <BellIcon />
      </IconButton>
    );
    const button = screen.getByRole('button', { name: Strings.Common.notifications });
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
