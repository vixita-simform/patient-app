import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  RECORD_SUMMARY_TILE_ID,
  recordsDummyData,
  STACK_ROUTES,
  Strings,
} from "../../../src/constants";
import useRecordsScreen from "../../../src/screens/records/useRecordsScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

describe("useRecordsScreen", () => {
  it("builds the summary tiles with only prescriptions pressable", async () => {
    const { result } = await RenderWrapperForHooks(useRecordsScreen);
    const { labReportsCount, prescriptionsCount, dischargesCount } = recordsDummyData.stats;

    expect(result.current.summaryTiles).toEqual([
      {
        id: RECORD_SUMMARY_TILE_ID.labReports,
        value: labReportsCount,
        label: Strings.RecordsScreen.labReports,
        pressable: false,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.prescriptions,
        value: prescriptionsCount,
        label: Strings.RecordsScreen.prescriptions,
        pressable: true,
      },
      {
        id: RECORD_SUMMARY_TILE_ID.discharges,
        value: dischargesCount,
        label: Strings.RecordsScreen.discharges,
        pressable: false,
      },
    ]);
  });

  it("returns the month groups", async () => {
    const { result } = await RenderWrapperForHooks(useRecordsScreen);
    expect(result.current.groups).toBe(recordsDummyData.groups);
  });

  it("opens the lab report detail for a record", async () => {
    const { result } = await RenderWrapperForHooks(useRecordsScreen);
    await act(async () => result.current.onRecordPress("rec_1"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: STACK_ROUTES.labReportDetail,
      params: { id: "rec_1" },
    });
  });

  it("opens Medicines from the prescriptions tile only", async () => {
    const { result } = await RenderWrapperForHooks(useRecordsScreen);
    await act(async () => result.current.onSummaryTilePress(RECORD_SUMMARY_TILE_ID.labReports));
    expect(router.push).not.toHaveBeenCalled();

    await act(async () => result.current.onSummaryTilePress(RECORD_SUMMARY_TILE_ID.prescriptions));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.medicines);
  });
});
