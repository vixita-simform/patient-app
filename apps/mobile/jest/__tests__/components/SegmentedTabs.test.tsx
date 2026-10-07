import { screen, userEvent } from '@testing-library/react-native';

import { SegmentedTabs } from '../../../src/components';
import { RenderWrapper } from '../../Wrapper';

const ITEMS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
] as const;

describe('SegmentedTabs', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<SegmentedTabs activeId="upcoming" items={ITEMS} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('calls onPress with the tab id', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(<SegmentedTabs activeId="upcoming" items={ITEMS} onPress={onPress} />);
    await user.press(screen.getByRole('tab', { name: 'Completed' }));
    expect(onPress).toHaveBeenCalledWith('completed');
  });

  it('marks only the active tab as selected', async () => {
    await RenderWrapper(<SegmentedTabs activeId="completed" items={ITEMS} onPress={jest.fn()} />);
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Upcoming' })).not.toBeSelected();
    expect(screen.getByRole('tab', { name: 'Cancelled' })).not.toBeSelected();
  });
});
