import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findADoctorDummyData, getDoctorProfileDetails, STACK_ROUTES } from '../../constants';
import { scale } from '../../theme';
import type { DoctorProfileData, UseDoctorProfileScreenReturn } from './DoctorProfileScreenTypes';

/** Footer padding kept above the bottom safe-area inset. */
const FOOTER_BOTTOM_BASE = 12;

/**
 * State and handlers for the Doctor profile screen.
 * @returns {UseDoctorProfileScreenReturn} the looked-up doctor, request flags, footer inset and handlers.
 */
export default function useDoctorProfileScreen(): UseDoctorProfileScreenReturn {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { bottom } = useSafeAreaInsets();
  // Mock request state: the static data never loads or fails.
  const isLoading = false;
  const isError = false;
  const isFavourite = false;

  const doctor = useMemo<DoctorProfileData | null>(() => {
    const details = id ? getDoctorProfileDetails(id) : undefined;
    const summary = findADoctorDummyData.doctors.find((item) => item.id === id);
    return summary && details ? { summary, details } : null;
  }, [id]);

  const footerInsetStyle = useMemo<ViewStyle>(
    () => ({ paddingBottom: scale(FOOTER_BOTTOM_BASE) + bottom }),
    [bottom]
  );

  const onBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(STACK_ROUTES.findADoctor);
    }
  }, []);

  // TODO: favourite flow not built yet.
  const onFavouritePress = useCallback(() => {}, []);
  // TODO: video consult flow not built yet.
  const onVideoPress = useCallback(() => {}, []);
  const onBookPress = useCallback(() => {
    if (!id || !doctor) {
      return;
    }
    router.push({ pathname: STACK_ROUTES.bookAppointment, params: { id } });
  }, [id, doctor]);

  return {
    doctor,
    isLoading,
    isError,
    isFavourite,
    footerInsetStyle,
    onBackPress,
    onFavouritePress,
    onVideoPress,
    onBookPress
  };
}
