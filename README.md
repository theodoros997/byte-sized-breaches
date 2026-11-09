# Byte-Sized Breaches

Famous cyberattacks and security bugs, explained with small browser games. The main path is written for people with no tech background, and optional "Go deeper" notes carry the technical detail.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The hub: a shelf of "cartridges", one per incident. EternalBlue is playable; the rest are marked *coming soon*. |
| `eternalblue.html` | Case 01. Markup, story text and all styles for the EternalBlue explainer. |
| `eternalblue.js` | Case 01. Chapter navigation and the eight games. Plain JavaScript, no libraries. |

Everything is static. There is no build step and nothing to install. Fonts come from Google Fonts.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from disk also works.

To host it, upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages).

## The EternalBlue case

Ten chapters, built around one metaphor: Windows' file-sharing service (SMB) is a **mailroom clerk** behind hatch **445** who carries the building's master keys (the kernel).

| # | Chapter | Game | What it teaches |
| --- | --- | --- | --- |
| 0 | Start | n/a | Title screen |
| 1 | The mailroom | Send a package | What SMB and port 445 are; no password needed; kernel privileges |
| 2 | The bug | The stamp | The 32-bit vs 16-bit size bug, shown as a 5-digit label and a 4-digit stamp |
| 3 | The spill | Aim the spill | Buffer overflow and heap grooming; blue screen vs takeover; DoublePulsar |
| 4 | The leak | Mind the gap | NSA, Shadow Brokers, MS17-010, and the 59 days between fix and WannaCry |
| 5 | Outbreak | Outbreak town | Worm spread, patching as herd immunity, firewalls vs internal spread |
| 6 | Kill switch | Find the off switch | Marcus Hutchins and the $10.69 domain |
| 7 | NotPetya | Find the survivor | Wipers, stolen passwords, Maersk's Ghana backup |
| 8 | Break the chain | Break the chain | Which defence breaks which step |
| 9 | Timeline | n/a | Dated timeline and 12 sources |

Each chapter has its own URL (`eternalblue.html#outbreak`, `#killswitch` and so on), so you can link straight to a game.

**Look and feel:** a night-blue mailroom with manila "case board" game surfaces, rubber-stamp red, and a stencil display face (Big Shoulders Stencil) that suggests shipping crates and mail stamps. Body text is Source Sans 3 and technical notes use IBM Plex Mono.

## Adding a new case

1. Copy the structure, not the style. Make `heartbleed.html` + `heartbleed.js`, with chapters as `<section class="chapter" id="..." data-title="...">`. The router at the top of `eternalblue.js` can be reused as is.
2. Give it its own identity: palette, fonts and a central metaphor taken from the incident's world. The hub card colours (`--hb-*` etc. in `index.html`) hint at a direction for each planned case.
3. In `index.html`, turn its `<li class="cart soon ...">` into an `<a class="cart ..." href="heartbleed.html">`.
4. Keep the pattern: plain-language story → one small game per idea → optional "Go deeper" → sources.

## Accuracy notes

- The simulations are teaching models, not replays. Each says so on the page.
- Facts and figures come from the sources listed in the Timeline chapter (Microsoft, NVD, CISA, UK NAO, NCSC, MalwareTech, Check Point, Wired). The source links weren't re-checked from the build environment, so it's worth clicking through them once before sharing widely.
- Office names in the NotPetya game are illustrative. The Ghana survivor and the UK recovery centre are from the real story.
