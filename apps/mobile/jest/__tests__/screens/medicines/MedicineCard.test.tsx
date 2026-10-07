import { screen, userEvent } from '@testing-library/react-native';

import { MEDICINE_TINT, STATUS_BADGE_TONE, Strings } from '../../../../src/constants';
import { MedicineCard } from '../../../../src/screens/medicines/components';
import type { MedicineEntry } from '../../../../src/types';
import { RenderWrapper } from '../../../Wrapper';

const medicine: MedicineEntry = {
  id: 'med_iron_folic',
  name: 'Iron + Folic acid',
  statusLabel: Strings.MedicinesScreen.refillSoon,
  statusTone: STATUS_BADGE_TONE.coral,
  tintKey: MEDICINE_TINT.coral,
  dosage: '1 capsule · after lunch · 45 days',
  stockRemaining: 3,
  stockTotal: 45,
  showRefillButton: true
};

describe('MedicineCard', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<MedicineCard medicine={medicine} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders the stock label and a labelled progressbar', async () => {
    await RenderWrapper(<MedicineCard medicine={medicine} />);
    expect(screen.getByText(`3 ${Strings.Common.of} 45`)).toBeOnTheScreen();
    const bar = screen.getByLabelText(Strings.MedicinesScreen.stockLeft);
    // 3 / 45 = 6.67% -> the same rounded percent as the fill width.
    expect(bar).toHaveAccessibilityValue({ min: 0, max: 100, now: 7 });
  });

  it('clamps the progressbar value when stock exceeds the total', async () => {
    await RenderWrapper(
      <MedicineCard medicine={{ ...medicine, stockRemaining: 60, stockTotal: 45 }} />
    );
    expect(screen.getByLabelText(Strings.MedicinesScreen.stockLeft)).toHaveAccessibilityValue({
      now: 100
    });
  });

  it('renders the refill button disabled without a handler', async () => {
    await RenderWrapper(<MedicineCard medicine={medicine} />);
    expect(
      screen.getByRole('button', { name: Strings.MedicinesScreen.orderRefill })
    ).toBeDisabled();
  });

  it('calls the refill handler when one is passed', async () => {
    const user = userEvent.setup();
    const onOrderRefillPress = jest.fn();
    await RenderWrapper(
      <MedicineCard medicine={medicine} onOrderRefillPress={onOrderRefillPress} />
    );
    await user.press(screen.getByRole('button', { name: Strings.MedicinesScreen.orderRefill }));
    expect(onOrderRefillPress).toHaveBeenCalledTimes(1);
  });

  it('hides the refill button when not flagged', async () => {
    await RenderWrapper(<MedicineCard medicine={{ ...medicine, showRefillButton: false }} />);
    expect(
      screen.queryByRole('button', { name: Strings.MedicinesScreen.orderRefill })
    ).not.toBeOnTheScreen();
  });
});
