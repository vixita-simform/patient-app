import { applyDummyBookedSlots, TIME_SLOT_STATUS } from '../../../src/constants';
import { buildTimeSlots } from '../../../src/utils';

const { available: a, taken: t, past: p } = TIME_SLOT_STATUS;

describe('applyDummyBookedSlots', () => {
  it('marks every third slot taken on a future day', () => {
    const slots = applyDummyBookedSlots(
      buildTimeSlots(new Date(2026, 9, 2), new Date(2026, 9, 1, 11, 10))
    );
    expect(slots.map((slot) => slot.status)).toEqual([a, a, t, a, a, t, a, a, t, a]);
  });

  it('keeps past slots past', () => {
    const today = new Date(2026, 9, 1);
    const slots = applyDummyBookedSlots(buildTimeSlots(today, new Date(2026, 9, 1, 11, 30)));
    expect(slots.map((slot) => slot.status)).toEqual([p, p, p, p, a, t, a, a, t, a]);
  });
});
