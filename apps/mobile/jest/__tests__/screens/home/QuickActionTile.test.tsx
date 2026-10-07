import { screen, userEvent } from '@testing-library/react-native';

import { CalendarIcon } from '../../../../src/assets/icons';
import { Strings } from '../../../../src/constants';
import { QuickActionTile } from '../../../../src/screens/home/components';
import type { QuickActionVariant } from '../../../../src/screens/home/components/quick-action-tile/QuickActionTileTypes';
import { RenderWrapper } from '../../../Wrapper';

const VARIANTS: QuickActionVariant[] = ['green', 'blue', 'amber', 'emergency'];
const label = Strings.HomeScreen.bookVisit;

describe('QuickActionTile', () => {
  it.each(VARIANTS)('matches the snapshot for the %s variant', async (variant) => {
    await RenderWrapper(<QuickActionTile Icon={CalendarIcon} label={label} variant={variant} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each(VARIANTS)('fires onPress for the %s variant', async (variant) => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <QuickActionTile Icon={CalendarIcon} label={label} variant={variant} onPress={onPress} />
    );
    expect(screen.getByText(label)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: label }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
