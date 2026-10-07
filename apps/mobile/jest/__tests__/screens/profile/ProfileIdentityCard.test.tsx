import { screen, userEvent } from '@testing-library/react-native';

import { Strings } from '../../../../src/constants';
import { ProfileIdentityCard } from '../../../../src/screens/profile/components';
import { RenderWrapper } from '../../../Wrapper';

const PROPS = {
  initials: 'AP',
  name: 'Aarav Patel',
  uhid: 'CW-2024-08812',
  phone: '+91 98765 43210'
};

describe('ProfileIdentityCard', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<ProfileIdentityCard {...PROPS} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders initials, name, prefixed UHID and phone', async () => {
    await RenderWrapper(<ProfileIdentityCard {...PROPS} />);
    [
      'AP',
      'Aarav Patel',
      `${Strings.ProfileScreen.uhidPrefix}CW-2024-08812`,
      '+91 98765 43210'
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
  });

  it('calls onEditPress from the edit button', async () => {
    const user = userEvent.setup();
    const onEditPress = jest.fn();
    await RenderWrapper(<ProfileIdentityCard {...PROPS} onEditPress={onEditPress} />);
    await user.press(screen.getByRole('button', { name: Strings.ProfileScreen.editProfile }));
    expect(onEditPress).toHaveBeenCalledTimes(1);
  });
});
