import { screen } from "@testing-library/react-native";

import { HeartIcon } from "../../../../src/assets/icons";
import { Strings } from "../../../../src/constants";
import { VitalTile } from "../../../../src/screens/home/components";
import { RenderWrapper } from "../../../Wrapper";

describe("VitalTile", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <VitalTile
        Icon={HeartIcon}
        label={Strings.HomeScreen.heartRate}
        tone="coral"
        unit="bpm"
        value="78"
      />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders value, unit and label", async () => {
    await RenderWrapper(
      <VitalTile
        Icon={HeartIcon}
        label={Strings.HomeScreen.heartRate}
        tone="coral"
        unit="bpm"
        value="78"
      />,
    );
    expect(screen.getByText("78")).toBeOnTheScreen();
    expect(screen.getByText("bpm")).toBeOnTheScreen();
    expect(screen.getByText(Strings.HomeScreen.heartRate)).toBeOnTheScreen();
  });

  it("omits the unit when none is given", async () => {
    await RenderWrapper(
      <VitalTile
        Icon={HeartIcon}
        label={Strings.HomeScreen.bloodPressure}
        tone="blue"
        value="122/80"
      />,
    );
    expect(screen.getByText("122/80")).toBeOnTheScreen();
    expect(screen.getAllByText(/.+/)).toHaveLength(2);
  });
});
