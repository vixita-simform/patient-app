import { screen, userEvent } from "@testing-library/react-native";

import { RECORD_TRAILING_KIND, RECORD_TYPE, STATUS_BADGE_TONE } from "../../../../src/constants";
import { RecordRow } from "../../../../src/screens/records/components";
import type { RecordSummary } from "../../../../src/types";
import { RenderWrapper } from "../../../Wrapper";

/** Shared record rows: one per type, mixing badge and chevron trailing items. */
const LAB_REPORT: RecordSummary = {
  id: "rec_lab",
  type: RECORD_TYPE.labReport,
  title: "Lipid profile",
  subtitle: "Pathology lab · 12 Sep",
  trailing: { kind: RECORD_TRAILING_KIND.badge, label: "Normal", tone: STATUS_BADGE_TONE.green },
};

const SCAN: RecordSummary = {
  id: "rec_scan",
  type: RECORD_TYPE.scan,
  title: "ECG report",
  subtitle: "Cardiology · 10 Sep",
  trailing: { kind: RECORD_TRAILING_KIND.chevron },
};

const PRESCRIPTION: RecordSummary = {
  id: "rec_rx",
  type: RECORD_TYPE.prescription,
  title: "Prescription",
  subtitle: "Dr. Rohan Mehta · 9 Sep",
  trailing: { kind: RECORD_TRAILING_KIND.chevron },
};

describe("RecordRow", () => {
  it("matches the snapshot for a badge row", async () => {
    await RenderWrapper(<RecordRow record={LAB_REPORT} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("matches the snapshot for a chevron row", async () => {
    await RenderWrapper(<RecordRow record={SCAN} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the title, subtitle and badge label", async () => {
    await RenderWrapper(<RecordRow record={LAB_REPORT} />);
    expect(screen.getByText(LAB_REPORT.title)).toBeOnTheScreen();
    expect(screen.getByText(LAB_REPORT.subtitle)).toBeOnTheScreen();
    expect(screen.getByText("Normal")).toBeOnTheScreen();
  });

  it("fires onPress with the id for a lab-report row", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await RenderWrapper(<RecordRow record={LAB_REPORT} onPress={onPress} />);
    await user.press(screen.getByRole("button", { name: LAB_REPORT.title }));
    expect(onPress).toHaveBeenCalledWith(LAB_REPORT.id);
  });

  it.each([
    ["scan", SCAN],
    ["prescription", PRESCRIPTION],
    ["opted-out lab report", { ...LAB_REPORT, pressable: false }],
  ])("is not pressable for a %s row", async (_name, record) => {
    await RenderWrapper(<RecordRow record={record} onPress={jest.fn()} />);
    expect(screen.queryByRole("button")).not.toBeOnTheScreen();
  });

  it("is not pressable without a handler", async () => {
    await RenderWrapper(<RecordRow record={LAB_REPORT} />);
    expect(screen.queryByRole("button")).not.toBeOnTheScreen();
  });
});
