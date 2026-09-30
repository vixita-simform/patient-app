import { screen } from "@testing-library/react-native";

import { StatusBadge } from "../../../src/components";
import { Strings } from "../../../src/constants";
import { RenderWrapper } from "../../Wrapper";

describe("StatusBadge", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<StatusBadge label={Strings.HomeScreen.today} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders its label", async () => {
    await RenderWrapper(<StatusBadge label={Strings.DoctorProfileScreen.insuranceAccepted} />);
    expect(screen.getByText(Strings.DoctorProfileScreen.insuranceAccepted)).toBeOnTheScreen();
  });
});
