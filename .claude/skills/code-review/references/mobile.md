# Mobile Review Rules (`apps/mobile/`)

Applies to batches tagged `mobile`. Read `common.md` first.

**The coding rules live in `apps/mobile/CLAUDE.md`**: project structure, screens, imports,
styling, strings, constants and icons. Read it completely and review against it. Breaking one
of its rules is `STANDARD` unless it causes a bug. Do not copy those rules into this file.
Everything below is what CLAUDE.md does not cover: review-only checks for React Native.

Paths below are relative to `apps/mobile/`.

## Contents
1. Structure Checks
2. Expo & Routing
3. Hooks & Effects
4. Styling & Theme
5. Lists & Rendering Performance
6. Security & Privacy
7. Accessibility
8. Testing
9. Lint Rules Already Enforced

---

## 1. Structure Checks

For added or untracked files:

- A screen folder has `<Name>Screen.tsx` and `<Name>ScreenStyles.ts`, and `use<Name>Screen.ts` only if the screen has logic. A `<Name>ScreenTypes.ts` is needed when the hook returns an object (the return type is defined there).
- A screen is exported from `src/screens/index.ts`, and its route file in `src/app/` is a one-line re-export. A route file with UI or logic in it is `STANDARD`.
- A component folder has `<Name>.tsx`, `<Name>Styles.ts` and `<Name>Types.ts`, and is exported from the nearest `components/index.ts`.
- A component used by one screen sits in `src/screens/<feature>/components/`. One used by two or more screens sits in `src/components/`. A screen importing another screen's private component is `STANDARD`: move it to `src/components/`.
- A screen file over 300 lines is `STANDARD`: split sections into components.
- Before flagging a missing shared component, Grep `src/components/` for an existing one that does the same job. Duplicating an existing component is `STANDARD`.

## 2. Expo & Routing

- Navigation uses `router` / `Link` / `useLocalSearchParams` from `expo-router`. No `@react-navigation/*` imports in screens.
- Route pathnames come from `STACK_ROUTES` / `TAB_ROUTES` / `ROOT_ROUTES` in `src/constants/Routes.ts`. A hardcoded pathname string (`router.push("/doctor-profile")`) is `STANDARD`.
- A new screen route needs: a file in `src/app/`, an entry in `Routes.ts`, and a screen export. Report it as `NEW_ROUTE` so the orchestrator can check all three.
- Protected screens live under `src/app/(protected)/`. A screen with patient data added outside it is `CRITICAL` (it is reachable while signed out).
- Do not hand-edit `ios/` or `android/`; native config goes in `app.json` or a config plugin.
- New native libraries are installed with `npx expo install` (versions match the SDK). A version in `package.json` that `expo-doctor` would reject is `STANDARD`.
- Expo APIs change every SDK. If a change uses an Expo API you are not sure exists in the installed SDK (see `expo` in `package.json`), say so in the finding instead of guessing.

## 3. Hooks & Effects

- Navigation, handlers, effects and focus logic live in `use<Name>Screen.ts`, not in the screen file.
- The hook never returns JSX or a render function (`renderItem`). Those belong in the screen file.
- No function reference in the dependency array of `useCallback`, `useEffect`, `useMemo` or `useFocusEffect`. Depend on the values the function reads.
- Missing dependencies that cause stale values are `CRITICAL`.
- `useEffect` that subscribes, sets a timer or starts a request must return a cleanup. A state update that can run after unmount is `CRITICAL`.
- Use `useRef` for values that persist across renders without re-rendering; never `createRef` in a function component.
- `useLocalSearchParams` values are `string | string[] | undefined`. Using one without narrowing or checking it is `CRITICAL`.

## 4. Styling & Theme

- Style files follow the `(theme: ThemeMode) => StyleSheet.create({...})` pattern from CLAUDE.md and are read through `useTheme(...)`.
- Colors come from `Colors[theme]` (style files) or `theme.colors` (elsewhere). A hex, `rgb()` or named color anywhere in `src/` is `STANDARD`, including inside SVG icons.
- Margin and padding use `scale()`. Font sizes use `Fonts.size.*`, font weights `Fonts.weight.*`.
- Merging style arrays in JSX: pass an array (`style={[styles.a, isActive && styles.b]}`); do not build new style objects in render.
- Layout must not assume one screen size: no fixed widths or heights that break on small phones; use `flex`, `scale()` or `Metrics` values.

## 5. Lists & Rendering Performance

- A list longer than a screen uses `FlatList` / `SectionList`, never `ScrollView` + `.map()`.
- `FlatList` has a `keyExtractor` returning a stable id. Index keys on a list that can change are `STANDARD`.
- `renderItem` passed to a list is stable (`useCallback` or a function outside the component).
- Objects or arrow functions created in render and passed to `React.memo` children are `MINOR`.
- Heavy work (sorting, filtering, date formatting over a list) in render goes in `useMemo` in the hook.
- Images use `expo-image` with a fixed size; no full-resolution images in list rows.

## 6. Security & Privacy

- The auth token is read and written only through `src/utils/authStorage.ts` (`expo-secure-store`). Storing a token or patient data in `AsyncStorage`, a module variable that persists, or a log is `CRITICAL`.
- No API keys, base URLs with credentials, or secrets in source. Config comes from `app.json` / `expo-constants` / `EXPO_PUBLIC_*` env vars, and `EXPO_PUBLIC_*` values are public: never put a secret in one.
- Deep-link and route params are untrusted input. Validate them before using them in a request or to pick a screen.
- Patient data (names, phone numbers, vitals, reports, prescriptions) must not appear in `console.*` calls, error messages sent to analytics, or notification text visible on the lock screen.

## 7. Accessibility

- Every pressable (`Pressable`, `TouchableOpacity`, icon buttons) has `accessibilityRole` and an `accessibilityLabel` taken from `Strings`.
- Icon-only buttons always need an `accessibilityLabel`.
- Touch targets are at least 44×44 points (use `hitSlop` when the visual is smaller).
- Text uses `AppText` so it scales with the system font size; no fixed heights on text containers.
- State that is shown only by color (a status badge) also needs text or an `accessibilityLabel`.

## 8. Testing

- Tests live in `jest/__tests__/` in a folder matching the source area (`components/`, `screens/<feature>/`, `hooks/`, `utils/`), named `<Name>.test.tsx` or `.test.ts`.
- Render components with `RenderWrapper` and hooks with `RenderWrapperForHooks` from `jest/Wrapper.tsx`, so tests get the same providers as the app.
- Native modules are mocked in `jest/__mock__/` and registered in `jest/setup.ts`. A test that mocks the same module inline again is `MINOR`.
- A new shared component needs at least a render test. A new screen hook with logic needs tests for its handlers and for loading / error states when it has them.
- Snapshot changes in the diff must match an intended UI change. An updated snapshot with no matching source change is `STANDARD`.

## 9. Lint Rules Already Enforced

ESLint (`apps/mobile/eslint.config.js`) already errors on: inline styles, color literals,
unused styles, raw text outside `AppText`, `type` used for object shapes, and unsorted JSX
props. The orchestrator runs ESLint, so do not report these one by one. Only report them
when lint is clearly being bypassed (an `eslint-disable` added without a reason is `STANDARD`).
