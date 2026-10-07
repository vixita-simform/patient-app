import { screen, userEvent } from '@testing-library/react-native';

import { UsersIcon } from '../../../../src/assets/icons';
import { PROFILE_MENU_ID, PROFILE_MENU_TONE, Strings } from '../../../../src/constants';
import { ProfileMenuRow } from '../../../../src/screens/profile/components';
import { RenderWrapper } from '../../../Wrapper';

const { familyMembers } = Strings.ProfileScreen;

describe('ProfileMenuRow', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(
      <ProfileMenuRow
        isDivided
        badge="4"
        Icon={UsersIcon}
        id={PROFILE_MENU_ID.familyMembers}
        title={familyMembers}
        tone={PROFILE_MENU_TONE.blue}
      />
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('includes the badge in its label', async () => {
    await RenderWrapper(
      <ProfileMenuRow
        badge="4"
        Icon={UsersIcon}
        id={PROFILE_MENU_ID.familyMembers}
        isDivided={false}
        title={familyMembers}
        tone={PROFILE_MENU_TONE.blue}
      />
    );
    expect(screen.getByRole('button', { name: `${familyMembers}, 4` })).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
  });

  it('labels a row without a badge with its title and calls onPress with its id', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await RenderWrapper(
      <ProfileMenuRow
        Icon={UsersIcon}
        id={PROFILE_MENU_ID.personalInfo}
        isDivided={false}
        title={Strings.ProfileScreen.personalMedicalInfo}
        tone={PROFILE_MENU_TONE.green}
        onPress={onPress}
      />
    );
    await user.press(
      screen.getByRole('button', { name: Strings.ProfileScreen.personalMedicalInfo })
    );
    expect(onPress).toHaveBeenCalledWith(PROFILE_MENU_ID.personalInfo);
  });
});
