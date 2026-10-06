import { router, useLocalSearchParams } from "expo-router";

import { labReportDetailDummyData, STACK_ROUTES, Strings } from "../../../../src/constants";
import { RANGE_BAND } from "../../../../src/screens/lab-report-detail/components";
import useLabReportDetailScreen, {
  computeMarkerPercent,
} from "../../../../src/screens/lab-report-detail/useLabReportDetailScreen";
import { RenderWrapperForHooks } from "../../../Wrapper";

const mockedParams = jest.mocked(useLocalSearchParams);
const bandEnd = RANGE_BAND.start + RANGE_BAND.width;

describe("computeMarkerPercent", () => {
  it("maps normalMin to the band start and normalMax to the band end", () => {
    expect(computeMarkerPercent(12, 12, 16)).toBe(RANGE_BAND.start);
    expect(computeMarkerPercent(16, 12, 16)).toBe(bandEnd);
  });

  it("maps the range midpoint to the band centre", () => {
    expect(computeMarkerPercent(14, 12, 16)).toBe(RANGE_BAND.start + RANGE_BAND.width / 2);
  });

  it("places out-of-range values outside the band, clamped to the bar", () => {
    const low = computeMarkerPercent(11, 12, 16);
    expect(low).toBeLessThan(RANGE_BAND.start);
    expect(low).toBeGreaterThanOrEqual(0);
    expect(computeMarkerPercent(-1000, 12, 16)).toBe(0);
    expect(computeMarkerPercent(1000, 12, 16)).toBe(100);
  });

  it("returns 0 when max <= min", () => {
    expect(computeMarkerPercent(5, 10, 10)).toBe(0);
    expect(computeMarkerPercent(5, 10, 4)).toBe(0);
  });
});

describe("useLabReportDetailScreen", () => {
  afterEach(() => mockedParams.mockReturnValue({}));

  it("derives results and shows the alert when a result is coral", async () => {
    mockedParams.mockReturnValue({ id: "rec_cbc" });
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    const report = labReportDetailDummyData.rec_cbc;
    expect(result.current.report).toBe(report);
    expect(result.current.results).toHaveLength(report.results.length);
    result.current.results.forEach((row) =>
      expect(row.markerPercent).toBe(computeMarkerPercent(row.value, row.normalMin, row.normalMax)),
    );
    expect(result.current.showAlert).toBe(true);
  });

  it("returns no report, results or alert for an unknown id", async () => {
    mockedParams.mockReturnValue({ id: "rec_missing" });
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    expect(result.current.report).toBeNull();
    expect(result.current.results).toEqual([]);
    expect(result.current.showAlert).toBe(false);
  });

  it("returns no share/download handlers until a backend exists", async () => {
    mockedParams.mockReturnValue({ id: "rec_cbc" });
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    expect(result.current.onSharePress).toBeUndefined();
    expect(result.current.onDownloadPress).toBeUndefined();
  });

  it("goes back from the back button", async () => {
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    result.current.onBackPress();
    expect(router.back).toHaveBeenCalled();
  });

  it("titles the screen with the report's test name and formats the collection time", async () => {
    mockedParams.mockReturnValue({ id: "rec_cbc" });
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    expect(result.current.title).toBe(labReportDetailDummyData.rec_cbc.title);
    expect(result.current.sampleCollectedLabel).toBe("Thu, 24 Sep, 8:10 AM");
  });

  it("treats an array id param as unknown and uses a generic title", async () => {
    mockedParams.mockReturnValue({ id: ["rec_cbc"] });
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    expect(result.current.report).toBeNull();
    expect(result.current.title).toBe(Strings.Common.labReports);
  });

  it("falls back to Home when there is no history", async () => {
    jest.mocked(router.canGoBack).mockReturnValueOnce(false);
    const { result } = await RenderWrapperForHooks(() => useLabReportDetailScreen());
    result.current.onBackPress();
    expect(router.replace).toHaveBeenCalledWith(STACK_ROUTES.home);
  });
});
