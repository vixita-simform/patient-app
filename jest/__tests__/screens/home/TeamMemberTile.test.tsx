import { screen } from "@testing-library/react-native";
import { processColor } from "react-native";

import { TEAM } from "../../../../src/constants";
import { TeamMemberTile } from "../../../../src/screens/home/components";
import { theme } from "../../../../src/theme";
import type { TeamMember } from "../../../../src/types";
import { RenderWrapper } from "../../../Wrapper";

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
 * Gradient start colour of the rendered avatar.
 * @returns {unknown} The processed first gradient colour.
 */
const avatarStartColor = (): unknown =>
  (findNodes((node) => node.type.includes("LinearGradient"))[0].props.colors as unknown[])[0];

describe("TeamMemberTile", () => {
  it("matches the snapshot", async () => {
    await RenderWrapper(<TeamMemberTile member={TEAM[0]} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("shows only the first name and the role", async () => {
    const member: TeamMember = { id: 9, name: "  Sarah   Jane Murphy ", role: "Payroll", img: "SM" };
    await RenderWrapper(<TeamMemberTile member={member} />);
    expect(screen.getByText("Sarah")).toBeOnTheScreen();
    expect(screen.getByText("Payroll")).toBeOnTheScreen();
  });

  it.each([
    ["Accountant", theme.colors.primary],
    ["Tax Advisor", theme.colors.teal],
    ["Payroll", theme.colors.petrol],
    ["Financial Advisor", theme.colors.accent],
  ] as const)("uses the %s role colour", async (role, color) => {
    await RenderWrapper(<TeamMemberTile member={{ ...TEAM[0], role }} />);
    expect(avatarStartColor()).toBe(processColor(color));
  });

  it("falls back to accent for an unknown role", async () => {
    const member = { ...TEAM[0], role: "Auditor" } as unknown as TeamMember;
    await RenderWrapper(<TeamMemberTile member={member} />);
    expect(avatarStartColor()).toBe(processColor(theme.colors.accent));
  });
});
