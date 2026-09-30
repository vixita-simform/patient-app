import { screen, userEvent } from "@testing-library/react-native";

import { Strings } from "../../../../src/constants";
import { DoctorHero } from "../../../../src/screens/doctor-profile/components";
import { RenderWrapper } from "../../../Wrapper";

const hero = {
  initials: "RM",
  name: "Dr. Rohan Mehta",
  qualifications: "MBBS, MD, DM (Cardiology)",
};

describe("DoctorHero", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<DoctorHero {...hero} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the doctor identity", async () => {
    await RenderWrapper(<DoctorHero {...hero} />);
    expect(screen.getByText(hero.initials)).toBeOnTheScreen();
    expect(screen.getByText(hero.name)).toBeOnTheScreen();
    expect(screen.getByText(hero.qualifications)).toBeOnTheScreen();
  });

  it("fires the back and favourite handlers", async () => {
    const user = userEvent.setup();
    const onBackPress = jest.fn();
    const onFavouritePress = jest.fn();
    await RenderWrapper(
      <DoctorHero {...hero} onBackPress={onBackPress} onFavouritePress={onFavouritePress} />,
    );
    await user.press(screen.getByRole("button", { name: Strings.Common.back }));
    await user.press(screen.getByRole("button", { name: Strings.DoctorProfileScreen.favourite }));
    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(onFavouritePress).toHaveBeenCalledTimes(1);
  });

  it("reflects the favourite state", async () => {
    await RenderWrapper(<DoctorHero {...hero} />);
    const favourite = screen.getByRole("button", { name: Strings.DoctorProfileScreen.favourite });
    expect(favourite).not.toBeSelected();
    await RenderWrapper(<DoctorHero {...hero} isFavourite />);
    expect(
      screen.getByRole("button", { name: Strings.DoctorProfileScreen.favourite }),
    ).toBeSelected();
  });
});
