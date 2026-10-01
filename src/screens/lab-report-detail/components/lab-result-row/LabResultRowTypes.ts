import type { LabResultRowData } from "../../LabReportDetailScreenTypes";

export interface LabResultRowProps {
  result: LabResultRowData;
  /** Renders a top divider; true for every result except the first. */
  isDivided: boolean;
}
