import { fillTemplate } from "../../../src/utils";

describe("fillTemplate", () => {
  it("replaces every placeholder with its value", () => {
    expect(fillTemplate("Showing {shown} of {total}", { shown: 4, total: 11 })).toBe(
      "Showing 4 of 11",
    );
  });

  it("replaces a placeholder used more than once", () => {
    expect(fillTemplate("{name} and {name}", { name: "Ann" })).toBe("Ann and Ann");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(fillTemplate("Hi {name}, {missing}", { name: "Ann" })).toBe("Hi Ann, {missing}");
  });

  it("returns a template without placeholders unchanged", () => {
    expect(fillTemplate("Plain text", { name: "Ann" })).toBe("Plain text");
  });
});
