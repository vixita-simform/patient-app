# Backend Review Rules (`apps/backend/`)

Applies to batches tagged `backend`. Read `common.md` first.

The backend is a Next.js (App Router) API used by the mobile app and, later, the web app. It
has no pages. It is new, so these rules set the pattern early. Add rules here as the backend
grows (database, auth provider, background jobs).

Paths below are relative to `apps/backend/`.

## Contents
1. Structure
2. Route Handlers
3. Contracts & Shared Types
4. Input Validation
5. Errors & Status Codes
6. Auth & Patient Data
7. Configuration & Secrets
8. Data Access & Performance
9. Testing

---

## 1. Structure

- HTTP endpoints live only in `src/app/api/**/route.ts`. The URL comes from the folder path, so folders are kebab-case nouns (`/api/patients/me/appointments`, not `/api/getAppointments`).
- Route handlers stay thin: read the request, validate it, call a service, return the response.
- Business logic goes in `src/services/<domain>/` (e.g. `src/services/appointments/`). Database access goes in `src/repositories/<domain>/` once a database exists. Handlers never talk to the database directly.
- Code shared by several handlers (auth, error responses, validation helpers) goes in `src/lib/`.
- No `page.tsx`, React components or client code in the backend. UI belongs in mobile or the future web app.
- Folders imported from elsewhere have an `index.ts` barrel, following the mobile import rules (relative paths, import from the folder, not a file inside it).

## 2. Route Handlers

- Export one function per HTTP method (`GET`, `POST`, `PATCH`, `DELETE`). Use the method that matches the action: reads are `GET`, creates are `POST`, partial updates are `PATCH`.
- `GET` handlers have no side effects.
- Return with `Response.json(...)` (or `NextResponse.json`) and an explicit status for anything other than 200.
- Dynamic segments come from the handler's `params` argument; await it if the installed Next.js version makes it a Promise. Never parse the URL by hand to get them.
- Handlers that must never be cached (anything per-patient) must not be statically prerendered. Check the build output marks them dynamic (`ƒ`), or set `export const dynamic = "force-dynamic"`.

## 3. Contracts & Shared Types

- Every response body is typed with a type from `@patient-app/shared-types` (`const body: HomeDashboardResponse = ...`). An untyped or `any` response is `STANDARD`.
- Request body types also live in `shared-types` so the apps send the same shape.
- A change to a response shape is a breaking change for the mobile app. Report it as `CHANGED_EXPORT` (the shared type) and check mobile callers.
- Dates go over the wire as ISO 8601 strings with a time-zone offset. Money is a number in the smallest unit or a decimal string; never a formatted string like `"₹1,200"`. Formatting is the app's job.
- Report every new endpoint as `NEW_ENDPOINT` with its method and path.

## 4. Input Validation

- Every request body, query param and path param is validated before use, with a schema (e.g. zod) that rejects unknown or wrong-typed fields. Using `await request.json()` without validation is `CRITICAL`.
- Validation failures return 400 with the error shape from section 5, listing which fields failed.
- IDs from the client are checked for format and for ownership (section 6), not just existence.
- Limit sizes: string lengths, array lengths, page size (`limit` has a maximum).

## 5. Errors & Status Codes

- All errors use one shape: `{ error: { code: string, message: string, details?: unknown } }`. A one-off error shape is `STANDARD`.
- Status codes: 400 invalid input, 401 not signed in, 403 signed in but not allowed, 404 not found, 409 conflict (e.g. slot already booked), 422 valid input that breaks a business rule, 500 unexpected.
- Unexpected errors are caught, logged on the server with context, and returned as a generic 500. Stack traces, SQL and internal messages never reach the client.
- `message` is safe to show to the user; `code` is stable so the apps can branch on it.

## 6. Auth & Patient Data

- Every route under `/api/patients/me/...` (and any route with patient data) checks the caller is signed in. A patient-data route with no auth check is `CRITICAL`.
- A patient can only read or change their own records. Looking up a record by an ID from the request without checking it belongs to the caller is `CRITICAL` (insecure direct object reference).
- `me` in a path means "the signed-in patient", taken from the verified token, never from a request parameter.
- Do not log tokens, passwords, OTPs or patient data. Log IDs instead.
- Responses include only the fields the client needs. Do not return internal fields (password hashes, internal notes, other patients' data).

## 7. Configuration & Secrets

- Secrets and environment-specific values come from `process.env`, read and validated in one module (`src/lib/env.ts`). Reading `process.env.X` directly elsewhere is `STANDARD`.
- No secrets in source, `next.config.ts` or committed `.env` files. Only `.env.example` is committed.
- `NEXT_PUBLIC_*` variables are sent to browsers. A secret in one is `CRITICAL`.
- CORS: only allow origins the apps use. `Access-Control-Allow-Origin: *` on an authenticated route is `CRITICAL`.

## 8. Data Access & Performance

- List endpoints are paginated (`limit` + cursor or page) and have a maximum page size.
- No database query or external call inside a loop over results (N+1). Batch it or join.
- Independent async calls run in parallel (`Promise.all`), not one after another.
- Writes that must succeed together (book a slot and create the appointment) run in a transaction.
- External calls have a timeout. A handler that can hang forever is `STANDARD`.

## 9. Testing

- Service functions have unit tests for the success path and each failure path (not found, forbidden, conflict).
- Each route has a test for: valid request, invalid input (400), missing auth (401) and another patient's resource (403/404) where it applies.
- Tests do not call real external services or a shared database.
