# React Native Project Conventions

This is the single source of truth for code review rules. Both the `code-review`
skill (orchestrator) and the `code-reviewer` sub-agent read this file. Edit rules
here only — never duplicate them elsewhere.

## Contents
1. File & Directory Structure
2. Naming Conventions
3. TypeScript
4. Components
5. Screens
6. Hooks
7. Redux
8. API Layer
9. Strings
10. Navigation
11. Testing
12. General Correctness, Security & Performance
13. Severity Guide

---

## 1. File & Directory Structure

- Feature modules live under `app/modules/<feature>/`. Each has: `<Name>Screen.tsx`, `<Name>Styles.ts`, `<Name>Types.ts`, `use<Name>.ts`, `index.ts`, and optional sub-component folders.
- Sub-components follow the same pattern: `<SubName>.tsx`, `<SubName>Styles.ts`, `<SubName>Types.ts`, `<SubName>Utils.ts`, `index.ts`.
- Shared components under `app/components/<kebab-case>/`. Each has: `<PascalName>.tsx`, `<PascalName>Styles.ts`, `<PascalName>Types.ts`, `index.ts`.
- Barrel exports: every folder **must** have an `index.ts`. Always import from the barrel, never from deep paths.

## 2. Naming Conventions

- PascalCase: components, screens, types, interfaces, enums, style files (e.g., `HomeScreen.tsx`)
- camelCase: hooks (`useSignin.ts`), utils (`NavigatorUtils.ts`), constants files
- kebab-case: directory names (`custom-button/`, `signin-form/`)
- Hooks prefixed with `use` always
- Types files suffix `Types.ts`, Styles files suffix `Styles.ts`, Utils files suffix `Utils.ts`

## 3. TypeScript

- `strict: true` is enforced — no implicit `any`
- Use `interface` not `type` for object shapes (`@typescript-eslint/consistent-type-definitions`)
- Use `type` keyword for union/intersection types and primitive aliases
- Screen prop types must use `NativeStackScreenProps<ParamList, RouteName>`
- All exported functions must have explicit return types
- No `@ts-ignore` without a comment explaining why
- `noUnusedLocals` and `noUnusedParameters` are on — remove dead code

## 4. Components

- Every component receives a `*Types.ts` file defining its `Props` interface
- Style files export a theme factory function: `const styles = (theme: ThemeMode) => StyleSheet.create({...})`
- Always spread `ApplicationStyles(theme)` first if using shared styles: `StyleSheet.create({ ...ApplicationStyles(theme), ... })`
- Never hardcode colors — always `Colors[theme]?.colorName`
- Never hardcode sizes — always `scale(n)` from `Metrics`
- No inline styles in JSX (`react-native/no-inline-styles` is ERROR)
- No color literals in StyleSheet (`react-native/no-color-literals` is ERROR)
- No unused styles (`react-native/no-unused-styles` is ERROR)
- No raw text outside `<Text>` components (`react-native/no-raw-text` is ERROR)
- JSX props must be sorted: `callbacksLast`, `shorthandFirst`, `ignoreCase`
- Use `StyleSheet.flatten([...])` when merging multiple style arrays in JSX
- Interactive elements need `accessibilityLabel` and `accessibilityRole`

## 5. Screens

- Screens are thin: no business logic, no API calls, no dispatch calls
- All logic lives in a `use<ScreenName>.ts` hook
- Screen renders the view and passes hook return to sub-components via spread or explicit props
- `useTheme(styleSheet)` always called with the style factory function

## 6. Hooks

- Business logic hooks return the full Formik object or a typed `interface` defined in `*Types.ts`
- Use `useRef` not `createRef` for refs that persist across renders
- Abort in-flight requests on unmount: `useEffect(() => () => { refDispatch.current?.abort(); }, [])`
- Use `useDeepCompareEffect` / `useDeepCompareCallback` when deps are objects/arrays
- `useAppDispatch()` and `useAppSelector()` from `app/redux/useRedux.ts` — never raw `useDispatch`/`useSelector`

## 7. Redux

- Slice file: `<Name>Slice.ts` — contains `createAsyncThunkWithCancelToken` calls, `createSlice`, exports `<Name>Reducer` and `<Name>Actions`
- Initial state: `<Name>Initial.ts` — exports `INITIAL_STATE` as default and `<Name>StateType` as named export
- Selectors: `<Name>Selector.ts` — exports a typed `<Name>Selectors` object with selector functions
- Use `createAsyncThunkWithCancelToken<ResponseType>()` from `app/configs/APIConfig.ts` — never `createAsyncThunk` directly
- `unauthorizedAPI` for unauthenticated endpoints, `authorizedAPI` for authenticated
- Thunk actions registered via `builder.addCase` for `pending`, `fulfilled`, `rejected`
- All new reducers added to `combineReducers` in `Store.ts` and whitelisted in `persistConfig` if they need persistence

## 8. API Layer

- All API endpoint strings in `app/constants/APIConst.ts`
- Thunk action name strings in `app/constants/ToolkitAction.ts`
- Response types as interfaces in `app/types/`
- Never call `axios` or `fetch` directly — always `createAsyncThunkWithCancelToken`
- `authorizedAPI.addAsyncRequestTransform` is where the auth token is injected (the `TODO` comment)

## 9. Strings

- No hardcoded user-facing strings — always `Strings.<Namespace>.<key>` from `app/constants/Strings.ts`
- i18n keys follow `namespace:key` format in `en.json`
- Add new namespaces to both `en.json` AND `Strings.ts`

## 10. Navigation

- All route names in `app/constants/NavigationRoutes.ts` as `ROUTES` enum values
- Imperative navigation via `NavigatorUtils.ts` functions (`navigateWithParam`, `navigatePop`, etc.)
- Deep link paths defined in `getLinkConfiguration()` in `NavigatorUtils.ts`
- New routes added to `RootStackParamList` in `AppNavigation.tsx`

## 11. Testing

- Test files in `jest/__tests__/` with `.test.tsx` extension
- Use `RenderWrapper` from `jest/Wrapper.tsx` for components needing Redux
- Use `RenderWrapperForHooks` for hook tests via `renderHook`
- Mock files in `jest/__mock__/`
- Every new component needs at minimum a snapshot test
- Business logic hooks need unit tests for success/error/loading states
- Test assertions must be meaningful (not only snapshots)

## 12. General Correctness, Security & Performance

Apply these on top of the project conventions:

- **Correctness**: logic bugs, wrong types, missing null/undefined checks at system boundaries (API responses, route params, storage reads), unhandled promise rejections, stale closures in effects/callbacks, missing or wrong hook dependency arrays, state updates after unmount.
- **Security**: secrets/API keys/tokens hardcoded in source; tokens or PII written to logs (`console.log`); auth tokens stored in plain `AsyncStorage` instead of secure storage; unvalidated deep-link params used for navigation or API calls; `authorizedAPI` vs `unauthorizedAPI` mixed up.
- **Performance**: new objects/functions created in render and passed to memoized children, `FlatList` without `keyExtractor` or with index keys on mutable lists, heavy work in render instead of `useMemo`, `ScrollView` + `.map()` over long/unbounded lists, missing cleanup of listeners/timers/subscriptions.
- **Leftovers**: `console.log`, commented-out code blocks, `debugger`, unresolved `TODO`/`FIXME` added in this change.

## 13. Severity Guide

| Severity | Use for | Report section |
|---|---|---|
| `CRITICAL` | Will cause a bug, crash, data loss, security problem, or broken build/type error | Critical Issues |
| `STANDARD` | Violates a rule in sections 1–11 (naming, structure, pattern, missing test) | Standards Violations |
| `MINOR` | Non-blocking improvement, readability, small perf win | Minor Issues |

When unsure between two levels, pick the lower one and say why in the finding.
