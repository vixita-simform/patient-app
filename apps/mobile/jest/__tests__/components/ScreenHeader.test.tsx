import { screen, userEvent } from '@testing-library/react-native';

import { CustomText, ScreenHeader } from '../../../src/components';
import { SCREEN_HEADER_VARIANT, Strings } from '../../../src/constants';
import { RenderWrapper } from '../../Wrapper';

describe('ScreenHeader', () => {
  it('renders the title as a header', async () => {
    await RenderWrapper(<ScreenHeader title="Medicines" />);
    expect(screen.getByRole('header')).toHaveTextContent('Medicines');
  });

  it('shows a labelled back button only when a handler is given', async () => {
    const user = userEvent.setup();
    const onBackPress = jest.fn();
    await RenderWrapper(<ScreenHeader title="Medicines" onBackPress={onBackPress} />);
    await user.press(screen.getByRole('button', { name: Strings.Common.back }));
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });

  it('has no back button without a handler', async () => {
    await RenderWrapper(<ScreenHeader title="Medicines" />);
    expect(screen.queryByRole('button', { name: Strings.Common.back })).not.toBeOnTheScreen();
  });

  it('renders the trailing action', async () => {
    await RenderWrapper(
      <ScreenHeader
        right={<CustomText>Action</CustomText>}
        title="Medicines"
        variant={SCREEN_HEADER_VARIANT.large}
      />
    );
    expect(screen.getByText('Action')).toBeOnTheScreen();
  });
});
