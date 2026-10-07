import { act } from '@testing-library/react-native';
import { router } from 'expo-router';

import { findADoctorDummyData, STACK_ROUTES, Strings } from '../../../../src/constants';
import useFindADoctorScreen from '../../../../src/screens/find-a-doctor/useFindADoctorScreen';
import { RenderWrapperForHooks } from '../../../Wrapper';

const { doctorAvailableToday, doctorsAvailableToday } = Strings.FindADoctorScreen;

const renderScreenHook = () => RenderWrapperForHooks(() => useFindADoctorScreen());

describe('useFindADoctorScreen', () => {
  it('starts unfiltered with the API total', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.selectedSpecialty).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.listData).toEqual(
      findADoctorDummyData.doctors.map((doctor, index) =>
        expect.objectContaining({ ...doctor, tone: ['green', 'blue', 'amber'][index % 3] })
      )
    );
    expect(result.current.listData[0].nextSlotLabel).toBe('Tue, 6 Oct, 11:30 AM');
    expect(result.current.countLabel).toBe(
      `${findADoctorDummyData.totalAvailableToday} ${doctorsAvailableToday}`
    );
    expect(result.current.chips.map((chip) => chip.id)).toEqual([
      'all',
      'cardiology',
      'orthopedics',
      'pediatrics',
      'dermatology',
      'ent'
    ]);
  });

  it('narrows the list by specialty via onSpecialtyPress', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSpecialtyPress('orthopedics'));
    expect(result.current.selectedSpecialty).toBe('orthopedics');
    expect(result.current.listData.map((doctor) => doctor.id)).toEqual(['doc_478']);
    expect(result.current.countLabel).toBe(`1 ${doctorAvailableToday}`);
  });

  it('shows zero with the plural label when nothing matches', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSpecialtyPress('ent'));
    expect(result.current.listData).toHaveLength(0);
    expect(result.current.countLabel).toBe(`0 ${doctorsAvailableToday}`);
  });

  it('narrows the list by name search, ignoring case and whitespace', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSearchChange('  SNEHA '));
    expect(result.current.listData.map((doctor) => doctor.id)).toEqual(['doc_311']);
    expect(result.current.countLabel).toBe(`1 ${doctorAvailableToday}`);
  });

  it('matches the specialty label in search', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSearchChange('surgeon'));
    expect(result.current.listData.map((doctor) => doctor.id)).toEqual(['doc_478']);
  });

  it('uses the local count for a multi-match search', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSearchChange('dr.'));
    expect(result.current.listData).toHaveLength(3);
    expect(result.current.countLabel).toBe(`3 ${doctorsAvailableToday}`);
  });

  it('combines specialty and search filters', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSpecialtyPress('pediatrics'));
    await act(async () => result.current.onSearchChange('rohan'));
    expect(result.current.listData).toHaveLength(0);
  });

  it('returns to the API total when whitespace-only search is cleared back to all', async () => {
    const { result } = await renderScreenHook();
    await act(async () => result.current.onSearchChange('   '));
    expect(result.current.countLabel).toBe(
      `${findADoctorDummyData.totalAvailableToday} ${doctorsAvailableToday}`
    );
  });

  it('uses the doctor id as key', async () => {
    const { result } = await renderScreenHook();
    expect(result.current.keyExtractor(result.current.listData[1])).toBe('doc_311');
  });

  it('goes back when possible, else replaces with home', async () => {
    const canGoBack = jest.mocked(router.canGoBack);
    const { result } = await renderScreenHook();
    canGoBack.mockReturnValueOnce(true);
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalledTimes(1);
    canGoBack.mockReturnValueOnce(false);
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.home);
  });
});
