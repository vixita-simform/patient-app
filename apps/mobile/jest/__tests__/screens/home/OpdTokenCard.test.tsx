import { screen } from '@testing-library/react-native';

import { Strings } from '../../../../src/constants';
import { OpdTokenCard } from '../../../../src/screens/home/components';
import { RenderWrapper } from '../../../Wrapper';

const token = {
  department: 'Cardiology',
  tokenNumber: 'A-24',
  servingNumber: 'A-18',
  patientsAhead: 6,
  waitMinutes: 25,
  progress: 0.72
};

describe('OpdTokenCard', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<OpdTokenCard {...token} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders the token details and queue progress', async () => {
    await RenderWrapper(<OpdTokenCard {...token} />);
    const { about, minWait, nowServing, patientsAhead, yourOpdToken } = Strings.HomeScreen;
    expect(screen.getByText(`${yourOpdToken} · ${token.department}`)).toBeOnTheScreen();
    expect(screen.getByText(token.tokenNumber)).toBeOnTheScreen();
    expect(screen.getByText(nowServing)).toBeOnTheScreen();
    expect(screen.getByText(token.servingNumber)).toBeOnTheScreen();
    expect(screen.getByText(`${token.patientsAhead} ${patientsAhead}`)).toBeOnTheScreen();
    expect(screen.getByText(`${about} ${token.waitMinutes} ${minWait}`)).toBeOnTheScreen();
    const [bar] = screen.container.queryAll(
      (node) => node.props.accessibilityRole === 'progressbar'
    );
    expect(bar).toHaveAccessibilityValue({ now: 72 });
  });
});
