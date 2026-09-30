import { screen } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { StatsCard } from "../../../../src/screens/doctor-profile/components";
import { RenderWrapper } from "../../../Wrapper";

const stats = { experience: "14 yrs", patients: "3,200+", rating: "4.9" };

describe("StatsCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<StatsCard {...stats} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders each value with its label", async () => {
    await RenderWrapper(<StatsCard {...stats} />);
    const { experience, patients, rating } = Strings.DoctorProfileScreen;
    [stats.experience, stats.patients, stats.rating, experience, patients, rating].forEach(
      (text) => expect(screen.getByText(text)).toBeOnTheScreen(),
    );
  });
});
