import { screen } from '@testing-library/react-native';

import { DOSE_STATUS } from '../../../../src/constants';
import { DoseTimeline } from '../../../../src/screens/medicines/components';
import type { DoseChipData } from '../../../../src/screens/medicines/components';
import { RenderWrapper } from '../../../Wrapper';

const doses: readonly DoseChipData[] = [
  { id: '1', status: DOSE_STATUS.done, timeLabel: '8:00 AM', accessibilityLabel: '8:00 AM, Taken' },
  {
    id: '2',
    status: DOSE_STATUS.next,
    timeLabel: '2:00 PM',
    accessibilityLabel: '2:00 PM, Next dose'
  },
  {
    id: '3',
    status: DOSE_STATUS.pending,
    timeLabel: '8:00 PM',
    accessibilityLabel: '8:00 PM, Later today'
  }
];

describe('DoseTimeline', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<DoseTimeline doses={doses} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders every dose's time label", async () => {
    await RenderWrapper(<DoseTimeline doses={doses} />);
    doses.forEach((dose) => {
      expect(screen.getByText(dose.timeLabel)).toBeOnTheScreen();
    });
  });

  it("announces each dose's status, not only its colour", async () => {
    await RenderWrapper(<DoseTimeline doses={doses} />);
    doses.forEach((dose) => {
      expect(screen.getByLabelText(dose.accessibilityLabel)).toBeOnTheScreen();
    });
  });
});
