import { router } from "expo-router";
import { createElement, useCallback, useMemo, useState } from "react";
import type { ListRenderItem } from "react-native";

import { findADoctorDummyData, STACK_ROUTES, Strings } from "../../constants";
import type { DoctorSummary, SpecialtyId } from "../../types";
import { formatRelativeDateTime } from "../../utils";
import { DoctorCard } from "./components";
import type {
  DoctorAvatarTone,
  SpecialtyChipItem,
  UseFindADoctorScreenReturn,
} from "./FindADoctorScreenTypes";

/** Chip order as designed. */
const SPECIALTY_CHIPS: readonly SpecialtyChipItem[] = Object.freeze([
  { id: "all", label: Strings.FindADoctorScreen.all },
  { id: "cardiology", label: Strings.FindADoctorScreen.cardiology },
  { id: "orthopedics", label: Strings.FindADoctorScreen.orthopedics },
  { id: "pediatrics", label: Strings.FindADoctorScreen.pediatrics },
  { id: "dermatology", label: Strings.FindADoctorScreen.dermatology },
  { id: "ent", label: Strings.FindADoctorScreen.ent },
]);

const AVATAR_TONES: readonly DoctorAvatarTone[] = Object.freeze([
  "green",
  "blue",
  "amber",
]);

/** Tone per doctor id, keyed by position in the unfiltered list so it never changes with a filter. */
const TONE_BY_DOCTOR_ID: ReadonlyMap<string, DoctorAvatarTone> = new Map(
  findADoctorDummyData.doctors.map((doctor, index) => [
    doctor.id,
    AVATAR_TONES[index % AVATAR_TONES.length],
  ]),
);

const EMPTY_LIST: readonly DoctorSummary[] = Object.freeze([]);

/**
 * State and handlers for the Find a doctor screen.
 * @returns {UseFindADoctorScreenReturn} chips, list data and render helpers, count label and handlers.
 */
export default function useFindADoctorScreen(): UseFindADoctorScreenReturn {
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<SpecialtyId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Mock request state: the static data never loads or fails.
  const isLoading = false;
  const isError = false;

  const doctors = useMemo<readonly DoctorSummary[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    return findADoctorDummyData.doctors.filter(
      (doctor) =>
        (selectedSpecialty === "all" ||
          doctor.specialty === selectedSpecialty) &&
        (query === "" ||
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialtyLabel.toLowerCase().includes(query)),
    );
  }, [selectedSpecialty, searchQuery]);

  // Unfiltered shows the API total; any filter shows what the local match found.
  const isFiltered = selectedSpecialty !== "all" || searchQuery.trim() !== "";
  const count = isFiltered
    ? doctors.length
    : findADoctorDummyData.totalAvailableToday;
  const countLabel = `${count} ${
    count === 1
      ? Strings.FindADoctorScreen.doctorAvailableToday
      : Strings.FindADoctorScreen.doctorsAvailableToday
  }`;

  const onSpecialtyPress = useCallback((id: SpecialtyId) => {
    setSelectedSpecialty(id);
  }, []);

  const onBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(STACK_ROUTES.home);
    }
  }, []);

  // TODO: filter sheet not built yet.
  const onFilterPress = useCallback(() => {}, []);

  const onDoctorPress = useCallback((id: string) => {
    router.push({ pathname: STACK_ROUTES.doctorProfile, params: { id } });
  }, []);

  // Booking flow is not built yet, so Book opens the profile, which carries the booking CTA.
  const onBookPress = onDoctorPress;

  const renderItem = useCallback<ListRenderItem<DoctorSummary>>(
    ({ item }) =>
      createElement(DoctorCard, {
        id: item.id,
        initials: item.initials,
        tone: TONE_BY_DOCTOR_ID.get(item.id) ?? AVATAR_TONES[0],
        name: item.name,
        specialtyLabel: item.specialtyLabel,
        experienceYears: item.experienceYears,
        rating: item.rating,
        reviewCount: item.reviewCount,
        nextSlot: formatRelativeDateTime(item.nextSlotAt),
        availableToday: item.availableToday,
        onPress: onDoctorPress,
        onBookPress,
      }),
    [onDoctorPress, onBookPress],
  );

  const keyExtractor = useCallback((doctor: DoctorSummary) => doctor.id, []);

  return {
    chips: SPECIALTY_CHIPS,
    listData: isLoading || isError ? EMPTY_LIST : doctors,
    countLabel,
    isLoading,
    isError,
    selectedSpecialty,
    searchQuery,
    onSearchChange: setSearchQuery,
    onSpecialtyPress,
    renderItem,
    keyExtractor,
    onBackPress,
    onFilterPress,
  };
}
