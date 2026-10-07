import { screen } from '@testing-library/react-native';

import { Avatar } from '../../../src/components';
import { AVATAR_SIZE, AVATAR_TONE } from '../../../src/constants';
import { scale } from '../../../src/theme';
import { RenderWrapper } from '../../Wrapper';

describe('Avatar', () => {
  it('matches the snapshot with default tone and size', async () => {
    await RenderWrapper(<Avatar initials="AP" />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each(Object.values(AVATAR_TONE))('renders initials with the %s tone', async (tone) => {
    await RenderWrapper(<Avatar initials="RM" size={AVATAR_SIZE.compact} tone={tone} />);
    expect(screen.getByText('RM')).toBeOnTheScreen();
  });

  it('renders a different container style for the compact size', async () => {
    await RenderWrapper(<Avatar initials="RM" size={AVATAR_SIZE.compact} />);
    const compact = screen.getByText('RM').parent?.props.style;
    await RenderWrapper(<Avatar initials="RM" size={AVATAR_SIZE.regular} />);
    const regular = screen.getByText('RM').parent?.props.style;
    expect(compact).not.toEqual(regular);
  });

  it.each([
    [AVATAR_SIZE.compact, 44],
    [AVATAR_SIZE.regular, 48],
    [AVATAR_SIZE.large, 64],
    [AVATAR_SIZE.xLarge, 88]
  ])('sizes the %s avatar to %p', async (size, diameter) => {
    await RenderWrapper(<Avatar initials="RM" size={size} />);
    expect(screen.getByText('RM').parent?.props.style).toMatchObject({
      width: scale(diameter),
      height: scale(diameter)
    });
  });
});
