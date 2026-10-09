# Reading budget

Context is the scarce resource. Each participant reads only what its job needs.

| File | Orchestrator (main thread) | rdr-spec-writer | rdr-screen-builder | rdr-fidelity-checker |
| --- | --- | --- | --- | --- |
| original design HTML | **never** | **never** | **never** | **never** |
| `app.html`, `app.jsx` | never | grep only (by line range) | never | never |
| `inventory.json` | yes (index) | yes | no | no |
| `screens/<Name>.jsx` | no | **yes, whole** | only when spec says "see slice L.." | no |
| `screens/<Name>.facts.json` | no | yes (jq/grep for big ones) | no | no |
| `components/*.jsx`, `components.json` | no | yes, the ones it uses | no | no |
| `data/*.json` | no | `head` / count | yes, to write mocks/types | no |
| `tokens.json`, `typography.json` | no | grep values | no | no |
| `ref/*.png` | no | yes (look) | yes, default state only | yes |
| `ref/*.computed.json` | no | grep when a value is unclear | no | grep |
| `.build/<Name>.spec.json` | no | writes | **yes, whole** | `styleMap` via audit |
| `.build/<Name>.spec.md` | **§0 Digest only** | writes | yes | no |
| `.cache/project-inventory.md` | no | yes | yes | no |
| project `CLAUDE.md` | no | rules section | **yes** | no |
| `src/**` | no | no | only files it reuses/edits | built screen files |

Grep recipes:

```bash
# Digest only
sed -n '/^## 0\. Digest/,/^## 1\./p' design/.rdr/.build/HomeScreen.spec.md
# one screen's summary from the inventory
node -e "const i=require('./design/.rdr/inventory.json');console.log(JSON.stringify(i.screens.find(s=>s.name==='HomeScreen'),null,1))"
# styles of one element by line
node -e "const f=require('./design/.rdr/screens/HomeScreen.facts.json');console.log(JSON.stringify(f.styles.filter(s=>s.line===263)))"
# computed font of a text in the reference
grep -n '"text": "Recent Documents"' -A3 design/.rdr/ref/HomeScreen.computed.json
```

Pass **paths** between agents, never file contents. Never ask an agent to
paste back what it wrote.
