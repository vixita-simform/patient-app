import { fireEvent, screen } from "@testing-library/react-native";

import { CLIENT_CODES, Strings } from "../../../../src/constants";
import { ClientCodeRow } from "../../../../src/screens/home/components";
import { RenderWrapper } from "../../../Wrapper";

const client = CLIENT_CODES[0];
const label = `${client.code}${Strings.Common.listSeparator}${client.name}`;

describe("ClientCodeRow", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<ClientCodeRow active client={client} onSelect={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders the code and name with an accessible label", async () => {
    await RenderWrapper(<ClientCodeRow active={false} client={client} onSelect={jest.fn()} />);
    expect(screen.getByText(client.code)).toBeOnTheScreen();
    expect(screen.getByText(client.name)).toBeOnTheScreen();
    expect(screen.getByLabelText(label)).toBeOnTheScreen();
  });

  it("marks the active row as selected", async () => {
    await RenderWrapper(<ClientCodeRow active client={client} onSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: label })).toBeSelected();
  });

  it("does not mark an inactive row as selected", async () => {
    await RenderWrapper(<ClientCodeRow active={false} client={client} onSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: label })).not.toBeSelected();
  });

  it("calls onSelect with its own client when pressed", async () => {
    const onSelect = jest.fn();
    await RenderWrapper(<ClientCodeRow active={false} client={client} onSelect={onSelect} />);
    await fireEvent.press(screen.getByRole("button", { name: label }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(client);
  });
});
