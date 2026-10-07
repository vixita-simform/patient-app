import { describe, expect, it } from "vitest";

import { GET, POST } from "../../src/app/api/[...path]/route";

describe("unknown /api routes", () => {
  it.each([["GET", GET], ["POST", POST]])("returns a JSON 404 for %s", async (_method, handler) => {
    const response = handler();
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "This API endpoint does not exist." },
    });
  });
});
