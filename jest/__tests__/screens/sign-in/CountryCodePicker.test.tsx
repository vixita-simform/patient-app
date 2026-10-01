import { screen, userEvent } from "@testing-library/react-native";

import { COUNTRY_CODES, DEFAULT_COUNTRY, Strings } from "../../../../src/constants";
import { CountryCodePicker } from "../../../../src/screens/sign-in/components";
import { RenderWrapper } from "../../../Wrapper";

const COPY = Strings.SignInScreen;

describe("CountryCodePicker", () => {
  it("shows the selected dial code and keeps the list closed", async () => {
    await RenderWrapper(
      <CountryCodePicker countries={COUNTRY_CODES} selected={DEFAULT_COUNTRY} onSelect={jest.fn()} />,
    );
    expect(screen.getByText(DEFAULT_COUNTRY.dialCode)).toBeOnTheScreen();
    expect(screen.queryByText(COPY.selectCountry)).not.toBeOnTheScreen();
  });

  it("opens the list, selects a row and closes", async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    await RenderWrapper(
      <CountryCodePicker countries={COUNTRY_CODES} selected={DEFAULT_COUNTRY} onSelect={onSelect} />,
    );

    await user.press(screen.getByRole("button", { name: COPY.changeCountryCode }));
    expect(screen.getByText(COPY.selectCountry)).toBeOnTheScreen();

    await user.press(screen.getByText("United States"));
    expect(onSelect).toHaveBeenCalledWith("US");
    expect(screen.queryByText(COPY.selectCountry)).not.toBeOnTheScreen();
  });

  it("closes from the backdrop without selecting", async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    await RenderWrapper(
      <CountryCodePicker countries={COUNTRY_CODES} selected={DEFAULT_COUNTRY} onSelect={onSelect} />,
    );

    await user.press(screen.getByRole("button", { name: COPY.changeCountryCode }));
    // Backdrop and the header close button share the label; the backdrop renders first.
    await user.press(screen.getAllByRole("button", { name: COPY.closeCountryPicker })[0]);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText(COPY.selectCountry)).not.toBeOnTheScreen();
  });
});
