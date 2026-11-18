# Byte-Sized Breaches

Famous cyberattacks and security bugs, explained with small browser games. The main path is written for people with no tech background, and optional "Go deeper" notes carry the technical detail.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The hub: a shelf of "cartridges", one per incident. EternalBlue and Pegasus are playable; the rest are marked *coming soon*. |
| `eternalblue.html` | Case 01. Markup, story text and all styles for the EternalBlue explainer. |
| `eternalblue.js` | Case 01. Chapter navigation and the eight games. Plain JavaScript, no libraries. |
| `pegasus.html` | Case 02. Markup, story text and all styles for the Pegasus explainer. |
| `pegasus.js` | Case 02. Chapter navigation and the eight games. |
| `stats.js` | Anonymous visit counts via GoatCounter, shared by all pages. See *Analytics* below. |
| `fonts/` | Self-hosted web fonts (`fonts.css` plus `.woff2` files) and their licenses (SIL Open Font License 1.1). |
| `SECURITY.md` | What the site does with visitors' data (nothing), and how to report problems. |

Everything is static. There is no build step and nothing to install.

**Privacy:** fonts are self-hosted, and there are no ads, cookies or third-party scripts. The only outside request is an anonymous visit count to GoatCounter (see below). Each page sets a strict Content Security Policy (scripts, styles and fonts from the site itself only; images also from GoatCounter) and a no-referrer policy. See `SECURITY.md`.

**Analytics:** `stats.js` sends anonymous counts to [GoatCounter](https://www.goatcounter.com) as a tiny image request, with no cookies and no GoatCounter script. It counts one view per hub visit, one per chapter reached in a case (each case's router fires a `chapterchange` event), and Ko-fi button clicks (as events named `kofi-click/<page>`). It sends nothing when the browser sets Do Not Track or Global Privacy Control, or when the site runs on `localhost` or from disk. To set it up, replace `your-goatcounter-code` with your GoatCounter code in `stats.js` and in the `img-src` part of the Content Security Policy in each `.html` page. New cases need the same CSP line, `<script src="stats.js"></script>` before their own script, and the `chapterchange` line in their router.

**Support link:** the hub and the end of each case (before the sources) have a "Support on Ko-fi" box. It is a plain link with no Ko-fi widget or script, so it adds no third-party requests. The Ko-fi page address appears in `index.html`, `eternalblue.html` and `pegasus.html`; search for `ko-fi.com/` to change it, and copy the `<aside class="support">` block into new cases.

When adding a new page, copy the `<meta http-equiv="Content-Security-Policy">` line from an existing page, link `fonts/fonts.css`, and add any new font to `fonts/` (with its license) rather than loading it from a CDN.

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

## The Pegasus case

Ten chapters about NSO Group's Pegasus spyware. The look is a night sky: progress is drawn as a constellation, the hero is the real Pegasus constellation (Scheat, Markab, Algenib, Alpheratz, Enif), and every game runs on a phone screen. Gold means starlight and safety; magenta means the spy. Fonts: Marcellus (display), Figtree (body), JetBrains Mono (logs).

Central metaphor: a phone is a house with many doors, and some doors open by themselves. That sets up the difference between one-click and zero-click attacks.

| # | Chapter | Game | What it teaches |
| --- | --- | --- | --- |
| 0 | Start | n/a | Title screen |
| 1 | Many doors | Who opens the door? | Attack surface: which things a phone processes without a tap |
| 2 | One tap (2016) | To tap or not to tap | Ahmed Mansoor's texts, the Trident zero-days, why reporting helps |
| 3 | Zero clicks (2019) | Incoming call | The WhatsApp missed-call bug: no choice could stop it |
| 4 | The picture computer (2021) | Build a computer from pixels | FORCEDENTRY: AND/OR/XOR on pixels, up to a half adder |
| 5 | What it sees | The operator's view | What spyware collects, and why encryption doesn't stop it |
| 6 | Who was watched | The forensic check | The Pegasus Project: 50,000 numbers, 67 phones checked, 37 with traces |
| 7 | The hunters | Spot the impostors | Fake process names (bh, roleaccountd, stagingd) and how investigators work |
| 8 | Staying safe | Could you have dodged it? | Updates, restarts, Lockdown Mode, threat warnings |
| 9 | Timeline | n/a | Dated timeline and 12 sources |

## Adding a new case

1. Copy the structure, not the style. Make `heartbleed.html` + `heartbleed.js`, with chapters as `<section class="chapter" id="..." data-title="...">`. The router at the top of `eternalblue.js` can be reused as is.
2. Give it its own identity: palette, fonts and a central metaphor taken from the incident's world. The hub card colours (`--hb-*` etc. in `index.html`) hint at a direction for each planned case.
3. In `index.html`, turn its `<li class="cart soon ...">` into an `<a class="cart ..." href="heartbleed.html">`.
4. Keep the pattern: plain-language story → one small game per idea → optional "Go deeper" → sources.

## Accuracy notes

- The simulations are teaching models, not replays. Each says so on the page.
- Facts and figures come from the sources listed in each case's Timeline chapter (for EternalBlue: Microsoft, NVD, CISA, UK NAO, NCSC, MalwareTech, Check Point, Wired; for Pegasus: Citizen Lab, Amnesty International, Forbidden Stories, Google Project Zero, Apple, the US Commerce Department, NVD). The source links weren't re-checked from the build environment, so it's worth clicking through them once before sharing widely.
- In the Pegasus case, Lena, her messages and the example link are invented.
- Office names in the NotPetya game are illustrative. The Ghana survivor and the UK recovery centre are from the real story.
