import { router } from "expo-router";

import { DOSE_STATUS, medicinesDummyData, STACK_ROUTES, Strings } from "../../../../src/constants";
import useMedicinesScreen from "../../../../src/screens/medicines/useMedicinesScreen";
import { RenderWrapperForHooks } from "../../../Wrapper";

describe("useMedicinesScreen", () => {
  it("builds the doses-taken label from the dose statuses", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    expect(result.current.dosesTakenLabel).toBe(
      `2 ${Strings.Common.of} 4 ${Strings.MedicinesScreen.dosesTakenSuffix}`,
    );
  });

  it("joins the prescriber and date with the dot separator", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    expect(result.current.prescriberLine).toBe(
      `Dr. Rohan Mehta${Strings.Common.dotSeparator}Tue, 22 Sep`,
    );
  });

  it("formats each dose's time and spoken status", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    expect(result.current.doses).toEqual([
      { id: "dose_8am", status: DOSE_STATUS.done, timeLabel: "8:00 AM", accessibilityLabel: `8:00 AM, ${Strings.MedicinesScreen.taken}` },
      { id: "dose_1pm", status: DOSE_STATUS.done, timeLabel: "1:00 PM", accessibilityLabel: `1:00 PM, ${Strings.MedicinesScreen.taken}` },
      { id: "dose_6pm", status: DOSE_STATUS.next, timeLabel: "6:00 PM", accessibilityLabel: `6:00 PM, ${Strings.MedicinesScreen.doseNext}` },
      { id: "dose_10pm", status: DOSE_STATUS.pending, timeLabel: "10:00 PM", accessibilityLabel: `10:00 PM, ${Strings.MedicinesScreen.dosePending}` },
    ]);
    expect(result.current.medicines).toBe(medicinesDummyData.activePrescription.medicines);
  });

  it("returns no add/refill handlers until those flows exist", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    expect(result.current.onAddPress).toBeUndefined();
    expect(result.current.onOrderRefillPress).toBeUndefined();
  });

  it("goes back from the back button", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalled();
  });

  it("falls back to Home when there is no history", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.home);
  });
});
