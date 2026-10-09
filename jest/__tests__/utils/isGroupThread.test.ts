import { isGroupThread } from "../../../src/utils";

describe("isGroupThread", () => {
  it.each([
    [[], false],
    [["staff"], false],
    [["staff", "client"], false],
    [["staff", "client", "office"], true],
    [["a", "b", "c", "d"], true],
  ])("participants %p -> %p", (participants, expected) => {
    expect(isGroupThread({ participants })).toBe(expected);
  });
});
