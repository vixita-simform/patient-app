import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

import bcrypt from 'bcryptjs';

const KEY_LENGTH = 64;

const derive = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });

/**
 * Hashes a password with scrypt and a random salt.
 * @param password - the plain-text password.
 * @returns `<salt>:<hash>`, both base64url.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt);
  return `${salt.toString('base64url')}:${hash.toString('base64url')}`;
}

const BCRYPT_PREFIX = /^\$2[aby]\$/;

/**
 * Checks a password against a stored hash in constant time. Accepts the bcrypt hashes the
 * `users` table holds (`$2b$...`) and the `<salt>:<hash>` scrypt format from `hashPassword`.
 * @param password - the plain-text password to check.
 * @param stored - the stored hash.
 * @returns whether the password matches; false for a malformed stored hash.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (BCRYPT_PREFIX.test(stored)) {
    return bcrypt.compare(password, stored);
  }
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, 'base64url');
  const actual = await derive(password, Buffer.from(salt, 'base64url'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
