import { screen, userEvent } from "@testing-library/react-native";

import { RecipientPicker } from "../../../src/components";
import { Strings } from "../../../src/constants";
import type { Recipient } from "../../../src/types";
import { fillTemplate } from "../../../src/utils";
import { RenderWrapper } from "../../Wrapper";

const recipients: Recipient[] = [
  { id: "me", label: "Aoife Byrne", desc: "Primary contact" },
  { id: "office", label: "ifac Office", desc: "Kilkenny" },
];

describe("RecipientPicker", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(
      <RecipientPicker recipients={recipients} value={["me"]} onChange={jest.fn()} />,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows a single 'Shared with' row for one recipient", async () => {
    await RenderWrapper(
      <RecipientPicker recipients={[recipients[0]]} value={[]} onChange={jest.fn()} />,
    );
    expect(
      screen.getByText(
        fillTemplate(Strings.RecipientPicker.sharedWith, { name: recipients[0].label }),
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("checkbox")).not.toBeOnTheScreen();
  });

  it("adds an unchecked recipient on press", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await RenderWrapper(
      <RecipientPicker recipients={recipients} value={["me"]} onChange={onChange} />,
    );
    const office = screen.getByRole("checkbox", { name: recipients[1].label });
    expect(office).not.toBeChecked();
    await user.press(office);
    expect(onChange).toHaveBeenCalledWith(["me", "office"]);
  });

  it("removes a checked recipient on press", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await RenderWrapper(
      <RecipientPicker recipients={recipients} value={["me", "office"]} onChange={onChange} />,
    );
    const me = screen.getByRole("checkbox", { name: recipients[0].label });
    expect(me).toBeChecked();
    await user.press(me);
    expect(onChange).toHaveBeenCalledWith(["office"]);
  });

  it("shows the hint when something is selected and the error otherwise", async () => {
    await RenderWrapper(
      <RecipientPicker recipients={recipients} value={["me"]} onChange={jest.fn()} />,
    );
    expect(screen.getByText(Strings.RecipientPicker.hintSelected)).toBeOnTheScreen();

    await RenderWrapper(<RecipientPicker recipients={recipients} value={[]} onChange={jest.fn()} />);
    expect(screen.getByText(Strings.RecipientPicker.hintEmpty)).toBeOnTheScreen();
    expect(screen.queryByText(Strings.RecipientPicker.hintSelected)).not.toBeOnTheScreen();
  });
});
