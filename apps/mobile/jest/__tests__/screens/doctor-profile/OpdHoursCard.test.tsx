import { screen } from '@testing-library/react-native';

import { Strings } from '../../../../src/constants';
import { OpdHoursCard } from '../../../../src/screens/doctor-profile/components';
import type { OpdHoursEntry } from '../../../../src/types';
import { RenderWrapper } from '../../../Wrapper';

const rows: OpdHoursEntry[] = [
  { id: 'monFri', label: 'Mon – Fri', hours: '10:00 AM – 2:00 PM' },
  { id: 'sun', label: 'Sunday', hours: null }
];

describe('OpdHoursCard', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<OpdHoursCard rows={rows} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders open hours and the Closed label for a closed day', async () => {
    await RenderWrapper(<OpdHoursCard rows={rows} />);
    expect(screen.getByText(Strings.DoctorProfileScreen.opdHours)).toBeOnTheScreen();
    expect(screen.getByText('Mon – Fri')).toBeOnTheScreen();
    expect(screen.getByText('10:00 AM – 2:00 PM')).toBeOnTheScreen();
    expect(screen.getByText('Sunday')).toBeOnTheScreen();
    expect(screen.getAllByText(Strings.DoctorProfileScreen.closed)).toHaveLength(1);
  });

  it('shows no Closed label when every day has hours', async () => {
    await RenderWrapper(<OpdHoursCard rows={rows.slice(0, 1)} />);
    expect(screen.queryByText(Strings.DoctorProfileScreen.closed)).not.toBeOnTheScreen();
  });
});
