import { screen, userEvent } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  findADoctorDummyData,
  homeScreenDummyData,
  STACK_ROUTES,
  Strings,
} from "../../../src/constants";
import {
  DoctorProfileScreen,
  FindADoctorScreen,
  HomeScreen,
  ProfileScreen,
  RecordsScreen,
  VisitsScreen,
} from "../../../src/screens";
import { formatCurrency } from "../../../src/utils";
import { RenderWrapper } from "../../Wrapper";

const mockedParams = jest.mocked(useLocalSearchParams);

describe("HomeScreen", () => {
  it("renders the dashboard", async () => {
    await RenderWrapper(<HomeScreen />);
    const { firstName, lastName } = homeScreenDummyData.patient;
    const {
      bookVisit,
      callAmbulance,
      goodMorning,
      labReports,
      latestVitals,
      medicines,
      nextAppointment,
    } = Strings.HomeScreen;
    [goodMorning, `${firstName} ${lastName}`, bookVisit, labReports, medicines, callAmbulance,
      nextAppointment, latestVitals, homeScreenDummyData.opdToken.tokenNumber].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
    expect(
      screen.getByText(homeScreenDummyData.nextAppointment?.doctor.name ?? ""),
    ).toBeOnTheScreen();
  });

  it("opens Find a doctor from Book visit", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<HomeScreen />);
    await user.press(screen.getByRole("button", { name: Strings.HomeScreen.bookVisit }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.findADoctor);
  });
});

describe("FindADoctorScreen", () => {
  it("renders the header, count and doctors", async () => {
    await RenderWrapper(<FindADoctorScreen />);
    expect(screen.getByText(Strings.FindADoctorScreen.title)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${findADoctorDummyData.totalAvailableToday} ${Strings.FindADoctorScreen.doctorsAvailableToday}`,
      ),
    ).toBeOnTheScreen();
    findADoctorDummyData.doctors.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeOnTheScreen(),
    );
  });

  it("filters by specialty chip and shows the empty state", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<FindADoctorScreen />);
    await user.press(screen.getByRole("button", { name: Strings.FindADoctorScreen.ent }));
    expect(screen.getByText(Strings.FindADoctorScreen.emptyMessage)).toBeOnTheScreen();
  });

  it("filters by search text", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<FindADoctorScreen />);
    await user.type(screen.getByPlaceholderText(Strings.FindADoctorScreen.searchPlaceholder), "sneha");
    expect(screen.getByText("Dr. Sneha Kapoor")).toBeOnTheScreen();
    expect(screen.queryByText("Dr. Rohan Mehta")).not.toBeOnTheScreen();
    expect(
      screen.getByText(`1 ${Strings.FindADoctorScreen.doctorAvailableToday}`),
    ).toBeOnTheScreen();
  });
});

describe("DoctorProfileScreen", () => {
  it("renders a known doctor", async () => {
    mockedParams.mockReturnValue({ id: "doc_204" });
    await RenderWrapper(<DoctorProfileScreen />);
    const { about, bookAppointment, consultationFee, insuranceAccepted } =
      Strings.DoctorProfileScreen;
    ["Dr. Rohan Mehta", "MBBS, MD, DM (Cardiology)", about, consultationFee,
      formatCurrency(800), insuranceAccepted, bookAppointment].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
    expect(screen.queryByText(Strings.DoctorProfileScreen.notFound)).not.toBeOnTheScreen();
  });

  it("hides the insurance badge when not accepted", async () => {
    mockedParams.mockReturnValue({ id: "doc_478" });
    await RenderWrapper(<DoctorProfileScreen />);
    expect(screen.getByText("Dr. Vikram Desai")).toBeOnTheScreen();
    expect(
      screen.queryByText(Strings.DoctorProfileScreen.insuranceAccepted),
    ).not.toBeOnTheScreen();
  });

  it("shows the not-found text for an unknown id", async () => {
    mockedParams.mockReturnValue({ id: "doc_missing" });
    await RenderWrapper(<DoctorProfileScreen />);
    expect(screen.getByText(Strings.DoctorProfileScreen.notFound)).toBeOnTheScreen();
    expect(screen.queryByText(Strings.DoctorProfileScreen.about)).not.toBeOnTheScreen();
  });
});

describe("tab placeholder screens", () => {
  it.each([
    ["ProfileScreen", ProfileScreen, Strings.ProfileScreen.title],
    ["RecordsScreen", RecordsScreen, Strings.RecordsScreen.title],
  ])("%s renders its title", async (_name, Component, title) => {
    await RenderWrapper(<Component />);
    expect(screen.getByText(title)).toBeOnTheScreen();
  });
});

describe("VisitsScreen", () => {
  it("renders the Find a doctor screen without a back button", async () => {
    await RenderWrapper(<VisitsScreen />);
    expect(screen.getByText(Strings.FindADoctorScreen.title)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: Strings.Common.back })).not.toBeOnTheScreen();
    findADoctorDummyData.doctors.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeOnTheScreen(),
    );
  });
});
