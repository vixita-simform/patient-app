# Patient App monorepo

npm workspaces monorepo for the hospital patient platform. One `package-lock.json` and one `node_modules` at the root.

```
apps/
  mobile/          # @patient-app/mobile   Expo SDK 57 + Expo Router (React Native)
  backend/         # @patient-app/backend  Next.js 16, API-only (App Router route handlers)
  web/             # (planned) React web app; not created yet
packages/
  shared-types/    # @patient-app/shared-types  API request/response types shared by all apps
tsconfig.base.json # strictness flags every workspace extends
```

## Per-app rules

- Working in `apps/mobile/`: follow `apps/mobile/CLAUDE.md` and `apps/mobile/AGENTS.md` (screens, styling, strings, icons, Expo rules). Read them before editing mobile code.
- Working in `apps/backend/`: route handlers live in `src/app/api/**/route.ts`. Type every response with a type from `@patient-app/shared-types`.

## Shared code

- Any type that crosses the network (request body, response shape, domain model) belongs in `packages/shared-types/src/api/`, exported through its `index.ts`. Import it by package name (`import type { HomeDashboardResponse } from "@patient-app/shared-types"`), never by relative path across workspaces.
- Shared packages ship TypeScript source (`main` points at `src/index.ts`); there is no build step. Metro handles them automatically and the backend lists them in `transpilePackages` in `next.config.ts`. Add new shared packages there too.
- Shared packages must not import from any app, React Native or Next.js. Keep them platform-neutral so the future web app can use them.
- Mobile UI-only types (badge tones, tints, layout variants) stay in `apps/mobile`. Move a mobile API type into `shared-types` when the backend starts serving that endpoint.

## Dependencies

- Add a dependency to one workspace: `npm install <pkg> --workspace=@patient-app/backend`. For mobile, run `npx expo install <pkg>` from `apps/mobile/` so the version matches the SDK.
- Only one version of `react`, `react-dom` and `react-native` may exist in the repo; the root `overrides` pin React. Check with `npm ls react react-native`. Keep the backend's React version equal to the mobile one when upgrading the Expo SDK.

## Commands (from the root)

```bash
npm install          # install all workspaces
npm run mobile       # expo start
npm run backend      # next dev on :3000
npm run typecheck    # all workspaces
npm run lint         # all workspaces
npm run test         # all workspaces
```

Run typecheck and lint before declaring any task done.
