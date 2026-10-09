# React (web) JSX + inline styles → React Native

The design's styles are already camelCase objects, so most values copy over
verbatim. This table covers what does **not** copy over. Every number still
goes through the project's scale function, every colour through the theme,
every visible string through Strings — the project's `CLAUDE.md` rules win
over anything here.

## Elements

| Web | RN | Notes |
| --- | --- | --- |
| `div` | `View` | `onClick` on a div → wrap in `Pressable` (or make the `View` a `Pressable`) |
| `p`, `span`, `h1`–`h6`, `label`, text children | project text component (`AppText`) | `h1`–`h3` may carry a global font (see `global.css`, e.g. serif headings) |
| `button` | `Pressable` + text | `disabled` → `disabled` + disabled style; keep `opacity` states |
| `input` | `TextInput` | `type="password"` → `secureTextEntry`; `inputMode="numeric"` → `keyboardType="number-pad"`; `maxLength` same; `defaultValue` same; `placeholder` → Strings |
| `img` | `Image` / `expo-image` | `data:` / `asset:` sources → file under the project's assets dir, `require()` it |
| `<svg>` inline / `Icon name=` | icon component on `react-native-svg` | one icon file per design icon; reuse an existing icon when the paths match |
| `select` / absolute dropdown | bottom sheet (`Modal`) | the design usually already uses a sheet — keep it |
| `a` / "opens on web" | `Linking.openURL` / `expo-web-browser` | handler goes in `use<Name>Screen` |
| fixed overlay (`position:fixed; inset:0`) | `Modal transparent animationType="slide"` | backdrop `Pressable` closes |
| `input type=checkbox` / custom toggle | RN `Switch` or the design's own toggle | match the design's track/thumb sizes if custom |

## Layout

| Web style | RN | Notes |
| --- | --- | --- |
| `display:"flex"` | (default) | **RN defaults to `flexDirection:"column"`**; web flex defaults to row → add `flexDirection:"row"` whenever the web style has `display:flex` without `flexDirection` |
| `display:"grid", gridTemplateColumns:"1fr 1fr"` | row + `flexWrap:"wrap"` + `gap`, children `flex:1` / `width:"48%"` | `repeat(7,1fr)` calendars → rows of 7 with `width: \`${100/7}%\`` |
| `overflowY:"auto"` on a screen wrapper | `ScrollView` (`contentContainerStyle` gets the padding) | long `.map` lists of data → `FlatList` |
| `overflowX:"auto"` row of chips/avatars | horizontal `ScrollView`, `showsHorizontalScrollIndicator={false}` | |
| `height:"100%"`, `minHeight:"100vh"` | `flex:1` | |
| `maxWidth:320` app column | drop | the RN screen is the column |
| `margin:"0 auto"` | `alignSelf:"center"` | |
| `position:"absolute"` badges/dots | same | `top/right/left/bottom` copy over; `transform:"translateX(-50%)"` → compute with width or use a centered wrapper |
| `aspectRatio:"1"` | `aspectRatio:1` | number, not string |
| `flexShrink:0`, `minWidth:0` | same | `minWidth:0` matters for `numberOfLines` truncation in rows |
| `gap` | `gap` | supported in RN ≥0.71 |

## Box model shorthands — always expand

| Web | RN |
| --- | --- |
| `padding:"12px 0 16px"` | `paddingTop:12, paddingHorizontal:0, paddingBottom:16` |
| `padding:"9px 12px"` | `paddingVertical:9, paddingHorizontal:12` |
| `margin:"0 0 2px"` | `marginTop:0, marginHorizontal:0, marginBottom:2` |
| `border:"1px solid X"` | `borderWidth:1, borderColor:X` |
| `border:"2px dashed X"` | `borderWidth:2, borderStyle:"dashed", borderColor:X` |
| `borderTop:"1px solid X"` | `borderTopWidth:1, borderTopColor:X` |
| `borderRadius:"12px 12px 3px 12px"` | `borderTopLeftRadius:12, borderTopRightRadius:12, borderBottomRightRadius:3, borderBottomLeftRadius:12` |
| `borderRadius:"50%"` | `borderRadius: size/2` |
| `width:"100%"` | `alignSelf:"stretch"` or `width:"100%"` |

`margin:0` on `p`/`h*` is the web reset — drop it (RN text has no default margin).

## Paint

| Web | RN |
| --- | --- |
| `background:"#fff"` / `background:IFAC_CARD` | `backgroundColor` |
| `background:"linear-gradient(135deg,A,B)"` | `expo-linear-gradient` `<LinearGradient colors={[A,B]} start={{x:0,y:0}} end={{x:1,y:1}}>` (135deg ≈ top-left→bottom-right; 90deg = left→right; 160deg ≈ `start {x:0.33,y:0} end {x:0.67,y:1}`) |
| `radial-gradient` glow | `react-native-svg` `RadialGradient`, or drop if decorative (flag it) |
| `boxShadow:"0 1px 3px rgba(0,0,0,.08)"` | `shadowColor:"#000", shadowOpacity:0.08, shadowRadius:3, shadowOffset:{width:0,height:1}, elevation:1` |
| `rgba(255,255,255,.12)` | same string (normalise `.12` → `0.12`) — still a theme token |
| `opacity` | same |

## Text

| Web | RN |
| --- | --- |
| `fontSize` | project font-size token (nearest exact match; never invent a new size silently) |
| `fontWeight:700` (number) | `"700"` string / project weight token, and the matching font family if the project loads per-weight families |
| `fontFamily:"'Source Sans 3'..."` | loaded font family name (e.g. `SourceSans3_600SemiBold` via `@expo-google-fonts/source-sans-3`) |
| `textTransform:"uppercase"`, `letterSpacing` | same (letterSpacing in px, `.5` → `0.5`) |
| `lineHeight:1.5` (unitless) | `lineHeight: fontSize * 1.5` (RN needs px) |
| `whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"` | `numberOfLines={1}` (+ `ellipsizeMode="tail"`) — drop the three styles |
| `textDecoration:"line-through"` | `textDecorationLine:"line-through"` |
| `textAlign` | same |
| `<br/>` inside text | `\n` in the string |

## Drop (web-only, no RN equivalent)

`cursor`, `outline`, `boxSizing`, `transition`, `userSelect`, `title` attribute
(tooltip — keep its text only if it is an accessibility label), `overflow:"hidden"`
on text (handled by `numberOfLines`), `whiteSpace`, `textOverflow`, `::-webkit-scrollbar`.

## Behaviour

| Web | RN |
| --- | --- |
| `useState("screen")` + `setScreen("x")` switcher | real routes (expo-router): tabs for the bottom bar items, stack routes for everything else; `setScreen(back)` → `router.back()` |
| `onClick` | `onPress` (handler defined in `use<Name>Screen`) |
| `setTimeout` fake loading | keep as a TODO-marked mock in the hook, or wire to the real API if one exists |
| `@keyframes spin` | `ActivityIndicator` |
| splash pulse / slide animations | Reanimated, or `expo-splash-screen` + a simple fade; flag if skipped |
| `onChange={e=>set(e.target.value)}` | `onChangeText={set}` |
| hard-coded arrays (`DOCUMENTS`, ...) | typed mock data module (one per feature or shared `src/mocks/`) — the shape becomes the `<Name>Types.ts` interface |

## Design frame vs device

The design renders inside a fixed column (often 320–390px). Copy design px
values verbatim and wrap them in the scale function — do **not** rescale by
hand to the device width. References for comparison are rendered both at the
design width (`ref/`) and unclamped at device width (`ref-device/`).
