import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../../src/services/auth";

describe("password hashing", () => {
  it("verifies the password it hashed", async () => {
    const stored = await hashPassword("s3cret!");
    expect(await verifyPassword("s3cret!", stored)).toBe(true);
    expect(await verifyPassword("s3cret?", stored)).toBe(false);
  });

  it("salts each hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("verifies bcrypt hashes from the users table", async () => {
    const stored = bcrypt.hashSync("Patient@123", 4);
    expect(await verifyPassword("Patient@123", stored)).toBe(true);
    expect(await verifyPassword("patient@123", stored)).toBe(false);
  });

  it.each(["", "no-separator", ":hash", "salt:"])("rejects a malformed stored hash %p", async (stored) => {
    expect(await verifyPassword("anything", stored)).toBe(false);
  });
});
