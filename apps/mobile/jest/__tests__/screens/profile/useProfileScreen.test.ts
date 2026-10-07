import { act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { PROFILE_MENU_ID, PROFILE_STAT_ID, STACK_ROUTES, Strings } from '../../../../src/constants';
import { signOut } from '../../../../src/hooks';
import useProfileScreen from '../../../../src/screens/profile/useProfileScreen';
import { getStoredPatient } from '../../../../src/utils';
import { RenderWrapperForHooks } from '../../../Wrapper';

jest.mock('../../../../src/hooks', () => ({
  ...jest.requireActual('../../../../src/hooks'),
  signOut: jest.fn(() => Promise.resolve())
}));

jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  getStoredPatient: jest.fn(() => Promise.resolve(null))
}));

const renderScreenHook = () => RenderWrapperForHooks(() => useProfileScreen());

/** Presses the destructive "Log out" button of the confirmation alert. */
const confirmLogout = (alertSpy: jest.SpyInstance): void => {
  const buttons = alertSpy.mock.calls[0][2] as { onPress?: () => void }[];
  buttons[buttons.length - 1].onPress?.();
};

describe('useProfileScreen', () => {
  it('exposes the stats and menu rows in display order', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.stats.map((stat) => stat.id)).toEqual([
      PROFILE_STAT_ID.bloodGroup,
      PROFILE_STAT_ID.age,
      PROFILE_STAT_ID.weight
    ]);
    expect(result.current.menuItems.map((item) => item.id)).toEqual(Object.values(PROFILE_MENU_ID));
  });

  it('keeps stats and menu rows referentially stable across renders', async () => {
    const { result, rerender } = await renderScreenHook();
    const { stats, menuItems } = result.current;
    await rerender({});
    expect(result.current.stats).toBe(stats);
    expect(result.current.menuItems).toBe(menuItems);
  });

  it('navigates only for the personal info row', async () => {
    const { result } = await renderScreenHook();
    Object.values(PROFILE_MENU_ID).forEach((id) => result.current.onMenuItemPress(id));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.personalAndMedicalInfo);
  });

  it('asks for confirmation before logging out', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = await renderScreenHook();
    result.current.onLogoutPress();
    expect(signOut).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      Strings.ProfileScreen.logOutConfirmTitle,
      Strings.ProfileScreen.logOutConfirmMessage,
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });

  it('signs out when the logout is confirmed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = await renderScreenHook();
    result.current.onLogoutPress();
    await act(async () => confirmLogout(alertSpy));
    expect(signOut).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('alerts when sign out fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(signOut).mockRejectedValueOnce(new Error('secure store unavailable'));
    const { result } = await renderScreenHook();
    result.current.onLogoutPress();
    await act(async () => confirmLogout(alertSpy));
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenLastCalledWith(Strings.ProfileScreen.logOutFailed);
    alertSpy.mockRestore();
  });

  it('returns no settings or edit handlers and disables unbuilt menu rows', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.onSettingsPress).toBeUndefined();
    expect(result.current.onEditPress).toBeUndefined();
    expect(
      result.current.menuItems.filter((item) => item.isEnabled).map((item) => item.id)
    ).toEqual([PROFILE_MENU_ID.personalInfo]);
  });

  it('derives the age from the date of birth', async () => {
    jest.useFakeTimers({ now: new Date(2026, 2, 13) });
    (getStoredPatient as jest.Mock).mockResolvedValueOnce({
      id: '1',
      firstName: 'A',
      lastName: 'B',
      phone: '',
      email: '',
      gender: 'male',
      bloodGroup: null,
      weight: null,
      dateOfBirth: '1994-07-22'
    });
    const { result } = await renderScreenHook();
    expect(result.current.stats[1].value).toBe(`31${Strings.ProfileScreen.yrsSuffix}`);
    jest.useRealTimers();
  });
});
