import { screen } from '@testing-library/react-native';

import { ProgressBar } from '../../../src/components';
import { RenderWrapper } from '../../Wrapper';

/** The bar View is not an accessibility element, so it is found by its role prop. */
const getProgressBar = () => {
  const [bar] = screen.container.queryAll((node) => node.props.accessibilityRole === 'progressbar');
  return bar;
};

describe('ProgressBar', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<ProgressBar value={0.72} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each([
    [0.72, 72],
    [0.456, 46],
    [0, 0],
    [1, 100],
    [1.5, 100],
    [-0.4, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0]
  ])('maps value %p to accessibilityValue now=%p', async (value, now) => {
    await RenderWrapper(<ProgressBar value={value} />);
    expect(getProgressBar()).toHaveAccessibilityValue({ min: 0, max: 100, now });
  });

  it('sizes the fill to the clamped percentage', async () => {
    await RenderWrapper(<ProgressBar value={2} />);
    const [fill] = getProgressBar().children;
    expect(fill).toHaveStyle({ width: '100%' });
  });
});
