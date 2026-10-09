// Resolve a dependency from this skill's own node_modules first, then from the
// host project's (cwd). Any Expo / React Native project already ships
// @babel/parser and usually pngjs, so `npm i` in scripts/ is rarely needed.
import { createRequire } from 'node:module';
import { join } from 'node:path';

export function load(name) {
  const tries = [
    createRequire(import.meta.url),
    createRequire(join(process.cwd(), 'package.json')),
  ];
  for (const req of tries) {
    try {
      return req(name);
    } catch {
      /* try next */
    }
  }
  const dir = new URL('..', import.meta.url).pathname;
  throw new Error(`Cannot find module "${name}". Install it once with: npm i --prefix "${dir}"`);
}
