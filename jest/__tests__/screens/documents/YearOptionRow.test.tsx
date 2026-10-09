import { fireEvent, screen } from "@testing-library/react-native";

import { YearOptionRow } from "../../../../src/screens/documents/components";
import { RenderWrapper } from "../../../Wrapper";

describe("YearOptionRow", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<YearOptionRow active label={"2024"} value={"2024"} onSelect={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows the check icon and selected state only when active", async () => {
    await RenderWrapper(<YearOptionRow active label={"2024"} value={"2024"} onSelect={jest.fn()} />);
    expect(screen.getByTestId("year-option-check")).toBeOnTheScreen();
    expect(screen.getByLabelText("2024")).toBeSelected();

    await RenderWrapper(
      <YearOptionRow active={false} label={"2023"} value={"2023"} onSelect={jest.fn()} />,
    );
    expect(screen.queryByTestId("year-option-check")).toBeNull();
    expect(screen.getByLabelText("2023")).not.toBeSelected();
  });

  it("calls onSelect with its value", async () => {
    const onSelect = jest.fn();
    await RenderWrapper(
      <YearOptionRow active={false} label={"All years"} value={"All"} onSelect={onSelect} />,
    );
    await fireEvent.press(screen.getByLabelText("All years"));
    expect(onSelect).toHaveBeenCalledWith("All");
  });
});
