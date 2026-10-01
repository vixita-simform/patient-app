import { screen } from "@testing-library/react-native";

import { DOSE_STATUS } from "../../../../src/constants";
import { DoseTimeline } from "../../../../src/screens/medicines/components";
import type { DoseEntry } from "../../../../src/types";
import { RenderWrapper } from "../../../Wrapper";

const doses: readonly DoseEntry[] = [
  { id: "1", time: "8 AM", status: DOSE_STATUS.done },
  { id: "2", time: "2 PM", status: DOSE_STATUS.next },
  { id: "3", time: "8 PM", status: DOSE_STATUS.pending },
];

describe("DoseTimeline", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<DoseTimeline doses={doses} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders every dose's time label", async () => {
    await RenderWrapper(<DoseTimeline doses={doses} />);
    doses.forEach((dose) => {
      expect(screen.getByText(dose.time)).toBeOnTheScreen();
    });
  });
});
