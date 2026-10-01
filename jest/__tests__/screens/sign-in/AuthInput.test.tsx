import { fireEvent, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { COUNTRY_CODES, DEFAULT_COUNTRY, Strings } from "../../../../src/constants";
import { AuthInput } from "../../../../src/screens/sign-in/components";
import { Colors } from "../../../../src/theme";
import { RenderWrapper } from "../../../Wrapper";

const COPY = Strings.SignInScreen;

const baseProps = {
  label: COPY.tabPatientId,
  value: "",
  placeholder: COPY.patientIdPlaceholder,
  maxLength: 20,
  keyboardType: "default" as const,
  onChangeText: jest.fn(),
  onBlur: jest.fn(),
};

/** Border colour of the nearest bordered ancestor of the TextInput (the shared field container). */
const borderColorOf = (): unknown => {
  let node = screen.getByLabelText(COPY.tabPatientId).parent;

  while (node) {
    const color = StyleSheet.flatten(node.props.style)?.borderColor;

    if (color) {
      return color;
    }
    node = node.parent;
  }
  return undefined;
};

describe("AuthInput", () => {
  it("matches the snapshot as a mobile field with the country picker", async () => {
    await RenderWrapper(
      <AuthInput
        {...baseProps}
        countries={COUNTRY_CODES}
        country={DEFAULT_COUNTRY}
        keyboardType="number-pad"
        label={COPY.tabMobileNumber}
        placeholder={COPY.mobilePlaceholder}
        onCountrySelect={jest.fn()}
      />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders a plain field without the dial code when no country is given", async () => {
    await RenderWrapper(<AuthInput {...baseProps} />);
    expect(screen.getByText(COPY.tabPatientId)).toBeOnTheScreen();
    expect(screen.queryByText(DEFAULT_COUNTRY.dialCode)).not.toBeOnTheScreen();
  });

  it("highlights the border on focus and calls onBlur when focus leaves", async () => {
    const onBlur = jest.fn();
    await RenderWrapper(<AuthInput {...baseProps} onBlur={onBlur} />);
    expect(borderColorOf()).toBe(Colors.light.line);

    await fireEvent(screen.getByLabelText(COPY.tabPatientId), "focus");
    expect(borderColorOf()).toBe(Colors.light.green);

    await fireEvent(screen.getByLabelText(COPY.tabPatientId), "blur");
    expect(borderColorOf()).toBe(Colors.light.line);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("shows the error message and the error border", async () => {
    await RenderWrapper(<AuthInput {...baseProps} error={COPY.patientIdRequired} />);
    expect(screen.getByText(COPY.patientIdRequired)).toBeOnTheScreen();
    expect(borderColorOf()).toBe(Colors.light.coral);
  });

  it("forwards typed text", async () => {
    const onChangeText = jest.fn();
    await RenderWrapper(<AuthInput {...baseProps} onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText(COPY.tabPatientId), "CW-1");
    expect(onChangeText).toHaveBeenCalledWith("CW-1");
  });
});
