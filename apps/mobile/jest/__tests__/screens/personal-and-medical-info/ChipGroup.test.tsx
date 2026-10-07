import { screen, userEvent } from '@testing-library/react-native';

import { ChipGroup } from '../../../../src/screens/personal-and-medical-info/components';
import { RenderWrapper } from '../../../Wrapper';

const OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' }
];

describe('ChipGroup', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<ChipGroup options={OPTIONS} selectedId="male" onSelect={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('labels each chip and marks the selected one', async () => {
    await RenderWrapper(<ChipGroup options={OPTIONS} selectedId="male" onSelect={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Male' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Female' })).not.toBeSelected();
  });

  it('calls onSelect with the pressed chip id', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await RenderWrapper(<ChipGroup options={OPTIONS} selectedId="male" onSelect={onSelect} />);
    await user.press(screen.getByRole('button', { name: 'Female' }));
    expect(onSelect).toHaveBeenCalledWith('female');
  });
});
