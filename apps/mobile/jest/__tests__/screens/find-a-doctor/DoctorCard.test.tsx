import { screen, userEvent } from "@testing-library/react-native";

import { findADoctorDummyData, Strings } from "../../../../src/constants";
import { DoctorCard } from "../../../../src/screens/find-a-doctor/components";
import { RenderWrapper } from "../../../Wrapper";

const [doctor] = findADoctorDummyData.doctors;
// The card renders whatever label the hook formatted; keep it fixed so snapshots don't depend on today.
const NEXT_SLOT = "Today, 11:30 AM";

const renderCard = (onPress = jest.fn(), onBookPress = jest.fn(), availableToday = true) =>
  RenderWrapper(
    <DoctorCard
      availableToday={availableToday}
      experienceYears={doctor.experienceYears}
      id={doctor.id}
      initials={doctor.initials}
      name={doctor.name}
      nextSlot={NEXT_SLOT}
      rating={doctor.rating}
      reviewCount={doctor.reviewCount}
      specialtyLabel={doctor.specialtyLabel}
      tone="green"
      onBookPress={onBookPress}
      onPress={onPress}
    />,
  );

describe("DoctorCard", () => {
  it("matches the snapshot when available today", async () => {
    await renderCard();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("matches the snapshot when not available today", async () => {
    await renderCard(jest.fn(), jest.fn(), false);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the doctor details", async () => {
    await renderCard();
    const { nextAvailable, reviews, yrsExp } = Strings.DoctorCard;
    expect(screen.getByText(doctor.name)).toBeOnTheScreen();
    expect(
      screen.getByText(`${doctor.specialtyLabel} · ${doctor.experienceYears} ${yrsExp}`),
    ).toBeOnTheScreen();
    expect(screen.getByText(doctor.rating)).toBeOnTheScreen();
    expect(screen.getByText(`(${doctor.reviewCount} ${reviews})`)).toBeOnTheScreen();
    expect(screen.getByText(nextAvailable)).toBeOnTheScreen();
    expect(screen.getByText(NEXT_SLOT)).toBeOnTheScreen();
  });

  it("passes the id to onPress from the card body and the slot", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const onBookPress = jest.fn();
    await renderCard(onPress, onBookPress);
    await user.press(screen.getByRole("button", { name: doctor.name }));
    await user.press(
      screen.getByRole("button", {
        name: `${Strings.DoctorCard.nextAvailable} ${NEXT_SLOT}`,
      }),
    );
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(onPress).toHaveBeenNthCalledWith(1, doctor.id);
    expect(onPress).toHaveBeenNthCalledWith(2, doctor.id);
    expect(onBookPress).not.toHaveBeenCalled();
  });

  it("passes the id to onBookPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const onBookPress = jest.fn();
    await renderCard(onPress, onBookPress);
    await user.press(screen.getByRole("button", { name: Strings.DoctorCard.book }));
    expect(onBookPress).toHaveBeenCalledWith(doctor.id);
    expect(onPress).not.toHaveBeenCalled();
  });
});
