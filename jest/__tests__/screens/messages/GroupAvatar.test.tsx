import { screen } from "@testing-library/react-native";
import { StyleSheet, type ViewStyle } from "react-native";

import { GroupAvatar } from "../../../../src/screens/messages/components";
import { Colors, scale } from "../../../../src/theme";
import { RenderWrapper } from "../../../Wrapper";

const SIZE = 30;

interface JsonNode {
  props: { style?: unknown };
  children: (JsonNode | string)[] | null;
}

/** Finds the flattened style of the rendered node sized to the avatar diameter. */
const findCircleStyle = (node: JsonNode | string | null): ViewStyle | undefined => {
  if (!node || typeof node === "string") return undefined;
  const style = StyleSheet.flatten(node.props.style as ViewStyle);
  if (style?.width === scale(SIZE)) return style;
  for (const child of node.children ?? []) {
    const found = findCircleStyle(child);
    if (found) return found;
  }
  return undefined;
};

describe("GroupAvatar", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<GroupAvatar iconSize={15} size={SIZE} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("sizes the circle from the scaled diameter", async () => {
    await RenderWrapper(<GroupAvatar iconSize={15} size={SIZE} />);
    expect(findCircleStyle(screen.toJSON() as JsonNode)).toMatchObject({
      width: scale(SIZE),
      height: scale(SIZE),
      borderRadius: scale(SIZE) / 2,
      backgroundColor: Colors.light.successSoft,
    });
  });

  it("uses the muted background when muted", async () => {
    await RenderWrapper(<GroupAvatar muted iconSize={15} size={SIZE} />);
    expect(findCircleStyle(screen.toJSON() as JsonNode)).toMatchObject({
      backgroundColor: Colors.light.mutedSoft,
    });
  });
});
