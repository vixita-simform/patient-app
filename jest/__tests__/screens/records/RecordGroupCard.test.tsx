import { screen, userEvent } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { ReactTestRendererJSON } from "react-test-renderer";

import { RECORD_TRAILING_KIND, RECORD_TYPE, STATUS_BADGE_TONE } from "../../../../src/constants";
import { RecordGroupCard } from "../../../../src/screens/records/components";
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

/** Direct children of the card View (the first bordered node below the test providers). */
const cardChildren = (): ReactTestRendererJSON[] => {
  let node = screen.toJSON() as ReactTestRendererJSON | null;

  while (node && !StyleSheet.flatten(node.props.style)?.borderWidth) {
    node = (node.children?.[0] as ReactTestRendererJSON | undefined) ?? null;
  }
  return (node?.children ?? []) as ReactTestRendererJSON[];
};

describe("RecordGroupCard", () => {
  it("places a divider between rows only", async () => {
    await RenderWrapper(<RecordGroupCard records={[LAB_REPORT, SCAN, PRESCRIPTION]} />);
    const children = cardChildren();

    // row, divider, row, divider, row: dividers are the childless Views.
    expect(children).toHaveLength(5);
    expect(children.map((child) => !child.children?.length)).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it("renders a single row without a divider", async () => {
    await RenderWrapper(<RecordGroupCard records={[SCAN]} />);
    expect(cardChildren()).toHaveLength(1);
  });

  it("passes onRecordPress through to lab-report rows", async () => {
    const onRecordPress = jest.fn();
    const user = userEvent.setup();
    await RenderWrapper(
      <RecordGroupCard records={[LAB_REPORT, SCAN]} onRecordPress={onRecordPress} />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);

    await user.press(screen.getByRole("button", { name: LAB_REPORT.title }));
    expect(onRecordPress).toHaveBeenCalledWith(LAB_REPORT.id);
  });
});
