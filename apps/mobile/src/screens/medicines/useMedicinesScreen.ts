import { useCallback, useMemo } from "react";

import { DOSE_STATUS, medicinesDummyData, STACK_ROUTES, Strings } from "../../constants";
import type { DoseStatus } from "../../constants";
import { formatDate, formatTime, goBackOr } from "../../utils";
import type { DoseChipData } from "./components";
import type { UseMedicinesScreenReturn } from "./MedicinesScreenTypes";

/** Spoken status per dose, so "next" and "later" aren't told apart by colour alone. */
const DOSE_STATUS_LABEL = Object.freeze({
  [DOSE_STATUS.done]: Strings.MedicinesScreen.taken,
  [DOSE_STATUS.next]: Strings.MedicinesScreen.doseNext,
  [DOSE_STATUS.pending]: Strings.MedicinesScreen.dosePending,
} as const satisfies Record<DoseStatus, string>);

/**
 * Medicines screen state: static dummy data (no pagination/API) — today's
 * doses, the active prescription's prescriber line and its medicine cards.
 * @returns {UseMedicinesScreenReturn} doses, medicines and the screen's handlers.
 */
const useMedicinesScreen = (): UseMedicinesScreenReturn => {
  const { doses, activePrescription } = medicinesDummyData;

  const doseChips = useMemo<readonly DoseChipData[]>(
    () =>
      doses.map((dose) => {
        const timeLabel = formatTime(dose.scheduledAt);
        return {
          id: dose.id,
          status: dose.status,
          timeLabel,
          accessibilityLabel: `${timeLabel}, ${DOSE_STATUS_LABEL[dose.status]}`,
        };
      }),
    [doses],
  );

  const dosesTakenLabel = useMemo(() => {
    const takenCount = doses.filter((dose) => dose.status === DOSE_STATUS.done).length;
    return `${takenCount} ${Strings.Common.of} ${doses.length} ${Strings.MedicinesScreen.dosesTakenSuffix}`;
  }, [doses]);

  const prescriberLine = useMemo(
    () =>
      `${activePrescription.prescriberName}${Strings.Common.dotSeparator}${formatDate(activePrescription.prescribedAt)}`,
    [activePrescription.prescriberName, activePrescription.prescribedAt],
  );

  const onBackPress = useCallback(() => {
    goBackOr(STACK_ROUTES.home);
  }, []);

  return {
    doses: doseChips,
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
