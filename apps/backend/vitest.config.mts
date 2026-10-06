import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: { AUTH_TOKEN_SECRET: "test-secret-that-is-at-least-32-characters" },
  },
});
