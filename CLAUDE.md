@AGENTS.md

# Patient App (Hospital Management)

Expo SDK 57 + Expo Router, TypeScript, npm (`package-lock.json`).

## Project structure

All app code lives in `src/`.

```
src/
  app/                      # Expo Router routes ONLY; no UI or logic here
    _layout.tsx             # root Stack: loads Figtree fonts, holds splash, SafeAreaProvider, StatusBar
    (tabs)/
      _layout.tsx           # bottom tab navigator (expo-router/js-tabs)
      index.tsx             # Home tab    -> export { HomeScreen as default } from '../../screens'
      visits.tsx            # Visits tab
      records.tsx           # Records tab
      profile.tsx           # Profile tab
  assets/
    icons/                  # SVG icon components (react-native-svg) + index.ts barrel
  components/
    ui/                     # generic reusable UI: AppText, Screen
    index.ts                # barrel: import { AppText, Screen } from '../components'
  screens/
    <feature>/                # one folder per screen, see Screens below
      <Name>Screen.tsx        # UI, default-exported
      <Name>ScreenStyles.ts   # (theme: ThemeMode) => StyleSheet.create({...})
      use<Name>Screen.ts      # optional: navigation, handlers, effects
    index.ts                # barrel: export { default as HomeScreen } from './home/HomeScreen'
  hooks/
    index.ts                # barrel: import { useTheme } from '../hooks'
    useTheme.ts             # returns the active theme (light only for now)
  theme/
    Colors.ts               # palette; separate lightColors / darkColors objects
    Metrics.tsx             # scale(), width, height, globalMetrics
    Fonts.ts                # Fonts.family.*, Fonts.size.* and Fonts.weight.*
    index.ts                # exports `theme`, `themes`, types, and Metrics
  utils/                    # formatCurrency (INR, en-IN), formatDate / formatTime
  constants/
    index.ts                # barrel
    Routes.ts               # TAB_ROUTES route names
    Strings.ts              # all user-facing text, grouped per screen: Strings.HomeScreen.goodMorning
```

## Screens

Every screen gets its own folder in `src/screens/`. Create the folder if it does not exist. Split each screen into separate files by job:

```
src/screens/home/
  HomeScreen.tsx         # UI only: JSX, reads styles and handlers
  HomeScreenStyles.ts    # style object only
  useHomeScreen.ts       # only when needed: navigation, onPress handlers, useEffect, focus logic
  components/            # only when needed: pieces split out of the screen
    index.ts             # export { default as VitalTile } from './vital-tile/VitalTile';
    vital-tile/
      VitalTile.tsx
      VitalTileStyles.ts
      VitalTileTypes.ts
```

- **`<Name>Screen.tsx`**: renders the UI and nothing else. No navigation calls, handlers or effects written inline; take them from `use<Name>Screen`.
- **`<Name>ScreenStyles.ts`**: only the screen's style object. No components, hooks or logic. Write it as a function of the theme mode and default-export it:

  ```ts
  import { StyleSheet } from "react-native";

  import { Colors, scale, type ThemeMode } from "../../theme";

  const styles = (theme: ThemeMode) =>
    StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: Colors[theme].white,
        padding: scale(16),
      },
    });

  export default styles;
  ```

- **`use<Name>Screen.ts`**: create it only when the screen has logic. It holds navigation (`router`, `useLocalSearchParams`), onPress and other handlers, `useEffect`, and focus code (`useFocusEffect`). It returns what the screen needs.
  - It never returns a `renderItem` or JSX-producing function (e.g. a `FlatList` row renderer). That belongs in the screen file, as a plain function or JSX inline in the render, not built with `createElement` in the hook.
  - Never put a method (a function reference) inside the dependency array of `useCallback`, `useEffect`, or `useFocusEffect`. Depend only on the values that function reads, not on other functions.
- In the screen, get styles through `useTheme`:

  ```tsx
  import { useTheme } from "../../hooks";
  import HomeScreenStyles from "./HomeScreenStyles";
  import useHomeScreen from "./useHomeScreen";

  export default function HomeScreen() {
    const { styles } = useTheme(HomeScreenStyles);
    const { onPressBook } = useHomeScreen();
    // ...
  }
  ```

- **300-line limit:** a screen's code file (`<Name>Screen.tsx`) must stay at or under 300 lines. If it would go over, split sections of the UI into components and render them from the screen. Do the same before 300 lines when a block is clearly its own unit (a card, a tile, a list row).
  - A component used only by this screen goes in `src/screens/<feature>/components/<kebab-name>/`, with `<Name>.tsx`, `<Name>Styles.ts` (same `(theme: ThemeMode) => StyleSheet.create({...})` pattern) and `<Name>Types.ts` for its props. Export it from `src/screens/<feature>/components/index.ts` and import it with `import { VitalTile } from './components'`.
  - A component that two or more screens need goes in `src/components/<kebab-name>/` with the same files, exported from `src/components/index.ts`.
  - Components get data and handlers through props. Keep navigation and effects in `use<Name>Screen`.
- Files inside a screen folder import each other directly (`./HomeScreenStyles`), per the Imports rules below.
- Export the screen from `src/screens/index.ts`, then add a one-line route file in `src/app/` that re-exports it (`export { HomeScreen as default } from '../../screens'`).

## Imports

- Use relative paths only. Do not use the `@/` alias (it is not configured in `tsconfig.json`).
- Import from a folder's `index.ts`, never from a file inside it:
  ```ts
  import { Fonts, scale, theme } from "../../theme"; // good
  import Fonts from "../../theme/Fonts"; // bad: file inside the folder
  import { theme } from "@/theme"; // bad: alias
  ```
- Folders with an `index.ts`: `theme`, `components`, `assets/icons`, `hooks`, `constants`, `screens`, `utils`. When you add something to one of them, export it from that folder's `index.ts`. When you create a new folder that other code imports from, give it an `index.ts`.
- Inside a folder, sibling files import each other directly (`./Metrics`, `./CustomTextTypes`), never through their own `index.ts`, to avoid circular imports.

## Styling rules

- Use `StyleSheet.create` for styles. Functional components only.
- Never hardcode colors. In style files use `Colors[theme].<key>`; elsewhere use `theme.colors.<key>` from the `theme` folder.
- **Margin and padding:** always wrap the value in `scale()` from the `theme` folder:
  ```ts
  import { scale } from '../../theme';
  container: { padding: scale(16), marginTop: scale(8) }
  ```
- **Font size:** use `Fonts.size.<key>`, e.g. `fontSize: Fonts.size.h6`.
- **Font weight:** use `Fonts.weight.<key>`, e.g. `fontWeight: Fonts.weight.semiLow`.
  ```ts
  import { Fonts } from '../../theme';
  title: { fontSize: Fonts.size.h3, fontWeight: Fonts.weight.semi }
  ```
- Render text with `AppText` from the `components` folder, not raw `Text`, and wrap screens in `Screen`.

## Strings

- Never hardcode user-facing text in JSX, props (`label`, `title`, `placeholder`, `accessibilityLabel`) or alerts. Use a static string from `src/constants/Strings.ts`:
  ```tsx
  import { Strings } from '../../constants';

  <CustomText style={styles.textXs}>{Strings.HomeScreen.goodMorning}</CustomText>
  ```
- Group strings by screen or component, one `freezeStringsObject({...})` block each, named after it (`HomeScreen`, `VisitsScreen`, `AppointmentCard`), and add the block to the default export:
  ```ts
  const HomeScreen = freezeStringsObject({
    goodMorning: 'Good morning',
    bookVisit: 'Book visit',
  });

  export default Object.freeze({ HomeScreen });
  ```
- Keys are camelCase and describe the text (`seeAll`, `callAmbulance`). Before adding a key, check whether the same text already exists and reuse it.
- Dynamic values (names, dates, counts) come from data, not from `Strings`; only the static wording around them goes in `Strings`.

## Constants

- Never hardcode a fixed set of string/number values inline (variants, statuses, modes, keys) as a raw literal or an inline union type. Add it to `src/constants/Constants.ts` as an `as const` object plus its derived type, and import it from `src/constants`:
  ```ts
  export const BUTTON_VARIANT = {
    fill: 'fill',
    line: 'line',
  } as const;

  export type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];
  ```
  ```tsx
  import { BUTTON_VARIANT } from '../../constants';

  <CustomButton variant={BUTTON_VARIANT.fill} />
  ```
- Before adding a new constant object, check whether the same set of values already exists and reuse it.
- Route names and pathnames are the exception: they live in `src/constants/Routes.ts` (`TAB_ROUTES`, `STACK_ROUTES`), not `Constants.ts`.

## Icons

- Icons must be SVG components built on `react-native-svg`, stored in `src/assets/icons/` and exported from its `index.ts`.
- Import them from the `assets/icons` folder: `import { HomeIcon } from '../../assets/icons'`.
- Do not use `@expo/vector-icons`, icon fonts, or PNG icons.
- New icons follow the existing shape: props `size`, `color` and `strokeWidth` plus `SvgProps`, a 24×24 `viewBox`, and a default color from `theme.colors`, never a hex literal.
