import { screen, userEvent } from "@testing-library/react-native";

import { RECORD_SUMMARY_TILE_ID, Strings } from "../../../../src/constants";
import { RecordSummaryCard } from "../../../../src/screens/records/components";
import type { RecordSummaryTileData } from "../../../../src/screens/records/components";
import { RenderWrapper } from "../../../Wrapper";

const COPY = Strings.RecordsScreen;

const TILES: readonly RecordSummaryTileData[] = [
  { id: RECORD_SUMMARY_TILE_ID.labReports, value: 24, label: Strings.Common.labReports, pressable: false },
  { id: RECORD_SUMMARY_TILE_ID.prescriptions, value: 8, label: COPY.prescriptions, pressable: true },
  { id: RECORD_SUMMARY_TILE_ID.discharges, value: 3, label: COPY.discharges, pressable: false },
];

describe("RecordSummaryCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<RecordSummaryCard tiles={TILES} onTilePress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders every tile's value and label", async () => {
    await RenderWrapper(<RecordSummaryCard tiles={TILES} />);
    TILES.forEach(({ value, label }) => {
      expect(screen.getByText(`${value}`)).toBeOnTheScreen();
      expect(screen.getByText(label)).toBeOnTheScreen();
    });
  });

  it("only makes the pressable (prescriptions) tile a button", async () => {
    const onTilePress = jest.fn();
    const user = userEvent.setup();
    await RenderWrapper(<RecordSummaryCard tiles={TILES} onTilePress={onTilePress} />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
    await user.press(screen.getByRole("button", { name: COPY.prescriptions }));
    expect(onTilePress).toHaveBeenCalledWith(RECORD_SUMMARY_TILE_ID.prescriptions);

    await user.press(screen.getByText(Strings.Common.labReports));
    expect(onTilePress).toHaveBeenCalledTimes(1);
  });

  it("renders no buttons without a handler", async () => {
    await RenderWrapper(<RecordSummaryCard tiles={TILES} />);
    expect(screen.queryByRole("button")).not.toBeOnTheScreen();
  });
});
