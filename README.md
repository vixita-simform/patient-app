# Patient App

Monorepo for the hospital patient platform, managed with npm workspaces.

| Workspace | Path | Stack |
| --- | --- | --- |
| `@patient-app/mobile` | `apps/mobile` | Expo SDK 57, Expo Router, React Native |
| `@patient-app/backend` | `apps/backend` | Next.js 16 (API routes) |
| `@patient-app/shared-types` | `packages/shared-types` | TypeScript types shared across apps |
| web (planned) | `apps/web` | React web app, not created yet |

## Setup

Requires Node 20+ and npm 10+.

```bash
npm install
```

## Run

```bash
npm run mobile      # Expo dev server (or: npm run ios / npm run android)
npm run backend     # Next.js API on http://localhost:3000
```

Example endpoints: `GET /api/health`, `GET /api/patients/me/dashboard`.

## Checks

```bash
npm run typecheck
npm run lint
npm run test
```

Each script runs in every workspace that defines it. To target one workspace, add `--workspace=@patient-app/<name>`.

## Adding the web app later

1. Create `apps/web` (for example with Vite or Next.js) and give its `package.json` the name `@patient-app/web`.
2. Pin `react` and `react-dom` to the same version as `apps/mobile`.
3. Add `"@patient-app/shared-types": "*"` to its dependencies and run `npm install` from the root.
