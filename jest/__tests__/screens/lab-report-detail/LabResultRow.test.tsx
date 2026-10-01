import { screen } from "@testing-library/react-native";

import LabResultRow from "../../../../src/screens/lab-report-detail/components/lab-result-row/LabResultRow";
import type { LabResultRowData } from "../../../../src/screens/lab-report-detail/LabReportDetailScreenTypes";
import { RenderWrapper } from "../../../Wrapper";

const result: LabResultRowData = {
  id: "hemoglobin",
  name: "Hemoglobin",
  value: 13.5,
  unit: "g/dL",
  normalMin: 12,
  normalMax: 16,
  status: "green",
  statusLabel: "Normal",
  markerPercent: 50,
};

describe("LabResultRow", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<LabResultRow isDivided={false} result={result} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the result name, status label and unit", async () => {
    await RenderWrapper(<LabResultRow isDivided result={result} />);
    expect(screen.getByText(result.name)).toBeOnTheScreen();
    expect(screen.getByText(result.statusLabel)).toBeOnTheScreen();
    expect(screen.getByText(result.unit)).toBeOnTheScreen();
  });
});
