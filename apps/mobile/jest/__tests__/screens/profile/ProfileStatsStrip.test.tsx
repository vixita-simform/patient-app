import { screen } from '@testing-library/react-native';

import { PROFILE_STAT_ID } from '../../../../src/constants';
import { ProfileStatsStrip } from '../../../../src/screens/profile/components';
import { RenderWrapper } from '../../../Wrapper';

const STATS = [
  { id: PROFILE_STAT_ID.bloodGroup, value: 'B+', label: 'Blood group' },
  { id: PROFILE_STAT_ID.age, value: '34 yrs', label: 'Age' },
  { id: PROFILE_STAT_ID.weight, value: '72 kg', label: 'Weight' }
];

describe('ProfileStatsStrip', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<ProfileStatsStrip stats={STATS} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders each value over its label, in order', async () => {
    await RenderWrapper(<ProfileStatsStrip stats={STATS} />);
    expect(screen.getAllByText(/.+/).map((node) => node.props.children)).toEqual([
      'B+',
      'Blood group',
      '34 yrs',
      'Age',
      '72 kg',
      'Weight'
    ]);
  });
});
