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
  PersonalAndMedicalInfoScreen,
  ProfileScreen,
  RecordsScreen,
  SignInScreen,
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

describe("ProfileScreen", () => {
  it("renders the title, stats and menu", async () => {
    await RenderWrapper(<ProfileScreen />);
    const {
      age, familyMembers, helpSupport, insuranceClaims, logOut, personalMedicalInfo, settings,
      title, vitalsHistory, weight,
    } = Strings.ProfileScreen;
    [title, "Aarav Patel", Strings.Common.bloodGroup, "B+", age, "34 yrs", weight, "72 kg",
      personalMedicalInfo, insuranceClaims, vitalsHistory, helpSupport, logOut].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
    // "Settings" is both the header button's label and a menu row title.
    expect(screen.getAllByRole("button", { name: settings })).toHaveLength(2);
    expect(screen.getByText(settings)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: `${familyMembers}, 4` })).toBeOnTheScreen();
  });

  it("opens Personal & medical info from its menu row", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<ProfileScreen />);
    await user.press(
      screen.getByRole("button", { name: Strings.ProfileScreen.personalMedicalInfo }),
    );
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.personalAndMedicalInfo);
  });
});

describe("PersonalAndMedicalInfoScreen", () => {
  it("renders the form from the patient record", async () => {
    await RenderWrapper(<PersonalAndMedicalInfoScreen />);
    const COPY = Strings.PersonalAndMedicalInfoScreen;
    [COPY.title, COPY.fullName, COPY.dateOfBirth, COPY.gender, Strings.Common.bloodGroup,
      COPY.allergies, COPY.existingConditions, COPY.emergencyContact, COPY.saveChanges,
      "Penicillin", "Peanuts", "98250 11223"].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
    expect(screen.getByDisplayValue("Aarav Patel")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: COPY.dateOfBirth })).toHaveAccessibilityValue({
      text: "14 Mar 1992",
    });
    expect(screen.getByRole("button", { name: COPY.male })).toBeSelected();
    expect(screen.getByRole("button", { name: COPY.bloodBPositive })).toBeSelected();
  });

  it("removes an allergy", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<PersonalAndMedicalInfoScreen />);
    const { removeAllergy } = Strings.PersonalAndMedicalInfoScreen;
    await user.press(screen.getByRole("button", { name: `${removeAllergy} Penicillin` }));
    expect(screen.queryByText("Penicillin")).not.toBeOnTheScreen();
  });
});

describe("RecordsScreen", () => {
  it("renders its header title", async () => {
    await RenderWrapper(<RecordsScreen />);
    expect(screen.getByText(Strings.RecordsScreen.headerTitle)).toBeOnTheScreen();
  });

  it("disables the search button until search exists", async () => {
    await RenderWrapper(<RecordsScreen />);
    expect(screen.getByRole("button", { name: Strings.RecordsScreen.search })).toBeDisabled();
  });

  it("opens Medicines from the prescriptions tile", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<RecordsScreen />);
    await user.press(screen.getByRole("button", { name: Strings.RecordsScreen.prescriptions }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.medicines);
  });
});

describe("SignInScreen", () => {
  it("renders the mobile tab with Get OTP and password sign-in disabled", async () => {
    await RenderWrapper(<SignInScreen />);
    expect(screen.getByText(Strings.SignInScreen.title)).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(Strings.SignInScreen.mobilePlaceholder)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: Strings.SignInScreen.getOtp })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: Strings.SignInScreen.signInWithPassword }),
    ).toBeDisabled();
    expect(
      screen.getByRole("link", { name: Strings.SignInScreen.emergencyCall }),
    ).toBeOnTheScreen();
  });

  it("switches to the patient ID field", async () => {
    const user = userEvent.setup();
    await RenderWrapper(<SignInScreen />);
    await user.press(screen.getByText(Strings.SignInScreen.tabPatientId));
    expect(screen.getByPlaceholderText(Strings.SignInScreen.patientIdPlaceholder)).toBeOnTheScreen();
    expect(screen.queryByText("+91")).not.toBeOnTheScreen();
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
