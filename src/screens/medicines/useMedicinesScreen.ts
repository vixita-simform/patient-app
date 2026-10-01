import { router } from "expo-router";
import { useCallback, useMemo } from "react";

import { DOSE_STATUS, medicinesDummyData } from "../../constants";
import type { UseMedicinesScreenReturn } from "./MedicinesScreenTypes";

/**
 * Medicines screen state: static dummy data (no pagination/API) — today's
 * doses, the active prescription's prescriber line and its medicine cards.
 * @returns {UseMedicinesScreenReturn} doses, medicines and the screen's handlers.
 */
const useMedicinesScreen = (): UseMedicinesScreenReturn => {
  const { doses, activePrescription } = medicinesDummyData;

  const dosesTakenLabel = useMemo(() => {
    const takenCount = doses.filter((dose) => dose.status === DOSE_STATUS.done).length;
    return `${takenCount} of ${doses.length} taken`;
  }, [doses]);

  const prescriberLine = useMemo(
    () => `${activePrescription.prescriberName} · ${activePrescription.date}`,
    [activePrescription.prescriberName, activePrescription.date],
  );

  const onBackPress = useCallback(() => {
    router.back();
  }, []);

  // The header "+" button has no target defined by the design (spec §8: no handler).
  const onAddPress = useCallback(() => {
    // No-op placeholder until an "add medicine" flow/route is specified.
  }, []);

  // "Order refill from hospital pharmacy" has no destination defined by the design (spec §9 Q6).
  const onOrderRefillPress = useCallback(() => {
    // No-op placeholder until a refill flow/route is specified.
  }, []);

  return {
    doses,
    dosesTakenLabel,
    prescriberLine,
    medicines: activePrescription.medicines,
    onBackPress,
    onAddPress,
    onOrderRefillPress,
  };
};

export default useMedicinesScreen;
