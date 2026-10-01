import { router } from "expo-router";
import { useCallback, useMemo } from "react";

import { DOSE_STATUS, medicinesDummyData, Strings } from "../../constants";
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
    return `${takenCount} ${Strings.Common.of} ${doses.length} ${Strings.MedicinesScreen.dosesTakenSuffix}`;
  }, [doses]);

  const prescriberLine = useMemo(
    () =>
      `${activePrescription.prescriberName}${Strings.Common.dotSeparator}${activePrescription.date}`,
    [activePrescription.prescriberName, activePrescription.date],
  );

  const onBackPress = useCallback(() => {
    router.back();
  }, []);

  return {
    doses,
    dosesTakenLabel,
    prescriberLine,
    medicines: activePrescription.medicines,
    onBackPress,
    // The header "+" (spec §8) and "Order refill" (spec §9 Q6) have no flow yet, so
    // no handler is returned and the screen renders both buttons disabled.
    onAddPress: undefined,
    onOrderRefillPress: undefined,
  };
};

export default useMedicinesScreen;
