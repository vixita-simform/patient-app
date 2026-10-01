import { screen } from "@testing-library/react-native";

import { CustomText } from "../../../../src/components";
import { FormField } from "../../../../src/screens/personal-and-medical-info/components";
import { RenderWrapper } from "../../../Wrapper";

describe("FormField", () => {
  it("renders the label above its control", async () => {
    await RenderWrapper(
      <FormField label="Gender">
        <CustomText>control</CustomText>
      </FormField>,
    );
    const texts = screen.getAllByText(/.+/).map((node) => node.props.children);
    expect(texts).toEqual(["Gender", "control"]);
  });
});
