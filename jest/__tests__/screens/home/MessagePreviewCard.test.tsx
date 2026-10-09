import { fireEvent, screen } from "@testing-library/react-native";

import { StyleSheet, type ViewStyle } from "react-native";

import { MESSAGES, Strings } from "../../../../src/constants";
import { MessagePreviewCard } from "../../../../src/screens/home/components";
import { theme } from "../../../../src/theme";
import { RenderWrapper } from "../../../Wrapper";

const unread = { ...MESSAGES[0], unread: true };
const read = { ...MESSAGES[0], unread: false };
const label = `${unread.from}${Strings.Common.listSeparator}${unread.topic}`;

interface JsonNode {
  type: string;
  props: Record<string, unknown>;
  children: (JsonNode | string)[] | null;
}

/**
 * Collects rendered host nodes matching a predicate from the JSON tree.
 * @param {(node: JsonNode) => boolean} match - node predicate.
 * @returns {JsonNode[]} Matching nodes in tree order.
 */
const findNodes = (match: (node: JsonNode) => boolean): JsonNode[] => {
  const found: JsonNode[] = [];
  const visit = (node: JsonNode | string | null): void => {
    if (!node || typeof node === "string") {
      return;
    }
    if (match(node)) {
      found.push(node);
    }
    node.children?.forEach(visit);
  };
  const tree = screen.toJSON() as JsonNode | JsonNode[] | null;
  (Array.isArray(tree) ? tree : [tree]).forEach(visit);
  return found;
};

/**
 * Rendered unread dots (the only view filled with the accent colour).
 * @returns {JsonNode[]} Matching host View nodes.
 */
const unreadDots = (): JsonNode[] =>
  findNodes(
    (node) =>
      node.type === "View" &&
      StyleSheet.flatten(node.props.style as ViewStyle)?.backgroundColor === theme.colors.accent,
  );

describe("MessagePreviewCard", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<MessagePreviewCard message={unread} onPress={jest.fn()} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders sender, topic, preview and time with an accessible label", async () => {
    await RenderWrapper(<MessagePreviewCard message={unread} onPress={jest.fn()} />);
    expect(screen.getByText(unread.from)).toBeOnTheScreen();
    expect(screen.getByText(unread.topic)).toBeOnTheScreen();
    expect(screen.getByText(unread.preview)).toBeOnTheScreen();
    expect(screen.getByText(unread.time)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: label })).toBeOnTheScreen();
  });

  it("shows the unread dot for an unread thread", async () => {
    await RenderWrapper(<MessagePreviewCard message={unread} onPress={jest.fn()} />);
    expect(unreadDots()).toHaveLength(1);
  });

  it("hides the unread dot for a read thread", async () => {
    await RenderWrapper(<MessagePreviewCard message={read} onPress={jest.fn()} />);
    expect(unreadDots()).toHaveLength(0);
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await RenderWrapper(<MessagePreviewCard message={unread} onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: label }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
