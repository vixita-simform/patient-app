import { router } from "expo-router";

import { medicinesDummyData, Strings } from "../../../src/constants";
import useMedicinesScreen from "../../../src/screens/medicines/useMedicinesScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

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
      `Dr. Rohan Mehta${Strings.Common.dotSeparator}22 Sep`,
    );
  });

  it("exposes the dummy doses and medicines", async () => {
    const { result } = await RenderWrapperForHooks(() => useMedicinesScreen());
    expect(result.current.doses).toBe(medicinesDummyData.doses);
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
});
