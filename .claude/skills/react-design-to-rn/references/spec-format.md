# Screen spec format

`rdr-spec-writer` writes two files per screen into `<extractDir>/.build/`.
`rdr-screen-builder` builds only from these (plus the project inventory) and
`audit-styles.mjs` checks the result against `styleMap`. Keep them in sync —
this file is the contract between the three.

## `<Name>.spec.json`

```jsonc
{
  "screen": "HomeScreen",                 // design component name
  "rnName": "Home",                       // RN screen name → <rnName>Screen.tsx
  "feature": "home",                      // kebab folder under project.screensDir
  "route": {
    "file": "src/app/(tabs)/index.tsx",   // route file to create or point at the screen
    "kind": "tab",                        // tab | stack | modal | auth
    "path": "/",                          // expo-router path used for deep links / navigation
    "designKey": "home"                   // key in navigation.json routes
  },
  "sources": {
    "slice": "screens/HomeScreen.jsx",
    "facts": "screens/HomeScreen.facts.json",
    "refs": ["ref/HomeScreen.png", "ref/HomeScreen.full.png", "ref/HomeScreen.ccOpen=true.png"]
  },
  "states": [                             // every visual state the screen has
    { "id": "HomeScreen", "desc": "default" },
    { "id": "HomeScreen.ccOpen=true", "desc": "client-code sheet open", "trigger": "tap switch-client button" }
  ],
  "stringsNamespace": "HomeScreen",
  "strings": { "goodMorning": "Good morning", "viewAll": "View All" },   // reuse existing keys: "viewAll": "@Common.viewAll"
  "data": [
    { "name": "DOCUMENTS", "file": "data/DOCUMENTS.json", "use": "first 3 → Recent Documents", "type": "DocumentItem" }
  ],
  "navigation": [
    { "trigger": "bell", "to": "/notifications", "designTarget": "notifications" },
    { "trigger": "back", "to": "back" }
  ],
  "components": {
    "reuse":  [{ "design": "Card", "rn": "Card", "from": "src/components", "propsNote": "padding override 12" }],
    "create": [{ "design": "Sheet", "rn": "BottomSheet", "scope": "shared", "dir": "src/components/bottom-sheet" },
               { "design": null, "rn": "ClientCodeSheet", "scope": "local", "dir": "components/client-code-sheet" }]
  },
  "icons": [{ "design": "bell", "rn": "BellIcon", "exists": true }, { "design": "inline-4", "rn": "SwapIcon", "exists": false, "svg": "icons/inline-4.svg" }],
  "assets": [{ "design": "assets/logo_white.png", "rn": "src/assets/images/logo-white.png" }],
  "tree": [                               // RN element tree, top-down. Keep keys = styleMap keys.
    { "rn": "ScrollView", "style": "container", "contentStyle": "content", "children": [
      { "rn": "View", "style": "header", "children": [
        { "rn": "AppText", "style": "greeting", "text": "strings.goodMorning" },
        { "rn": "AppText", "style": "clientName", "text": "bind:client.name", "numberOfLines": 1 },
        { "rn": "Pressable", "style": "bellButton", "onPress": "onPressNotifications", "children": [
          { "rn": "BellIcon", "props": { "size": 20, "color": "text" } },
          { "rn": "View", "style": "badge", "if": "unread > 0", "children": [ { "rn": "AppText", "style": "badgeText", "text": "bind:unread" } ] }
        ]}
      ]},
      { "rn": "View", "style": "recentList", "map": "DOCUMENTS.slice(0,3)", "item": { "rn": "Card", "style": "docCard" } }
    ]}
  ],
  "styleMap": {                           // design px / colours, verbatim, RN props only, shorthands expanded
    "header": { "flexDirection": "row", "justifyContent": "space-between", "alignItems": "center", "paddingTop": 12, "paddingBottom": 16 },
    "greeting": { "color": "#545859", "fontSize": 12, "marginBottom": 2 },
    "ClientCodeSheet.row": { "paddingVertical": 13, "paddingHorizontal": 14, "borderRadius": 10, "borderWidth": 1.5 }
  },
  "tokens": { "#545859": "textSecondary", "#002B49": "text" },   // colour → theme key the builder must use
  "dropped": ["cursor:pointer (all)", "title tooltip on switch button"],
  "deviations": [ "splash pulse animation → static (flagged)" ],
  "openQuestions": [ ]
}
```

Rules:
- `styleMap` keys are the exact keys the builder must put in `StyleSheet.create`.
  Un-namespaced keys → `<rnName>ScreenStyles.ts`; `Comp.key` → `components/<comp>/<Comp>Styles.ts`.
- Values are **design values** (numbers in px, colours as hex/rgba, weights as
  strings). The builder converts them with scale/tokens; the audit converts
  back. Never pre-scale.
- Dynamic styles (`$cond` in facts) → two keys (`tab`, `tabActive`) or a note in
  `tree` (`"styleWhen": {"tabActive": "active"}`).
- `tree` may summarise repeated structure (`map` + `item`) — it is a build
  guide, not a full DOM dump.

## `<Name>.spec.md`

```
## 0. Digest            ≤40 lines — the ONLY section the orchestrator reads
- route / kind / folder
- states (ids)
- reuse: …   create: …   icons new: …
- data / types
- navigation
- risks / open questions
- over cap: <reason>     (only if the spec could not fit)
## 1. Layout             section-by-section walk of the screen, top → bottom
## 2. States             what changes per state
## 3. Interactions       handlers → hook functions
## 4. Notes for builder  anything the JSON cannot say
```

Cap: 250 lines. Larger screens: say so in the Digest (`over cap:`) and split
sections into local components in the spec instead of growing it.
