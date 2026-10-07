import { screen, userEvent } from '@testing-library/react-native';

import { Strings } from '../../../../src/constants';
import { AppointmentCard } from '../../../../src/screens/home/components';
import { RenderWrapper } from '../../../Wrapper';

const appointment = {
  initials: 'RM',
  doctorName: 'Dr. Rohan Mehta',
  detail: 'Cardiologist · Room 204',
  date: 'Tue, 29 Sep',
  time: '11:30 AM'
};

describe('AppointmentCard', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<AppointmentCard {...appointment} badgeLabel={Strings.Common.today} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders the appointment and fires onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <AppointmentCard {...appointment} badgeLabel={Strings.Common.today} onPress={onPress} />
    );
    expect(screen.getByText(appointment.doctorName)).toBeOnTheScreen();
    expect(screen.getByText(appointment.detail)).toBeOnTheScreen();
    expect(screen.getByText(appointment.date)).toBeOnTheScreen();
    expect(screen.getByText(appointment.time)).toBeOnTheScreen();
    expect(screen.getByText(Strings.Common.today)).toBeOnTheScreen();
    await user.press(
      screen.getByRole('button', {
        name: `${appointment.doctorName}, ${appointment.date}, ${appointment.time}`
      })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits the badge when no label is given', async () => {
    await RenderWrapper(<AppointmentCard {...appointment} />);
    expect(screen.queryByText(Strings.Common.today)).not.toBeOnTheScreen();
  });
});
