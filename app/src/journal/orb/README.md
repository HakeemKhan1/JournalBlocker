# Journal Blocker — "orb" prototype (`src/journal/orb/`)

A faithful React Native port of the Claude Design composition
**Journal Blocker.dc.html**
([design project](https://claude.ai/design/p/aa4edff1-4759-4b97-9e5c-1ff16488a678)).
Dark cosmic palette, a breathing gradient **orb** as the signature element,
Newsreader (serif) for display copy + Hanken Grotesk (sans) for UI.

`App.js` renders `orb/OrbApp`. (The earlier Apple-HIG prototype under
`src/journal/screens/` + `src/journal/PrototypeApp.js` is no longer wired in;
kept for reference.)

## Run / screenshot
```bash
cd journal-blocker/app
npm run web          # browser preview (design target)
# headless export used to verify this port:
npx expo export --platform web --output-dir dist-web
```

## Architecture
- **theme.js** — colour tokens (`C`), fonts (`SANS`/`SERIF`, web pulls the two
  Google fonts), gradient stop sets (`G`).
- **ui.js** — SVG-based `Orb`/`Glow` (gradients that work on web + native), the
  peach gradient CTA `GButton`, `Toggle`, `AppTile`, animated `Wave`/`Particles`,
  and the geometric glyphs (`Chevron`/`Lock`/`Mic`/`Check`).
- **data.js** — the mock journal entries, question bank, insights figures,
  feelings, blocked-app categories (copied verbatim from the design).
- **controller.js** — `useController`, a hook port of the design's `DCLogic`
  state machine. Holds all state + the mocked interactions (orb launch, voice
  typewriter, dictation, calendar, onboarding funnel) and exposes a flat
  `vals` view-model via `derive()` plus a `M` methods object.
- **PhoneFrame.js** — device chrome (status bar, notch, home indicator), bottom
  tab bar, left "screens" side-nav (wide viewports only).
- **OrbApp.js** — the screen router; switches the 12 screens off `vals.screen`.
- **screens/** — one component per screen, each `({ v, M, s })`. `kit.js` holds
  shared chrome (`Scroll`, `Section`, `Card`, `BackLink`, `CloseBtn`, `fill`).

## Real vs mocked
Same scope as the design: all UI / transitions are real; speech-to-text,
journal data, and the actual Screen Time blocking are mocked. Wiring the
journal-completion unlock through the native engine remains the next step
(see `../README.md` and `SPEC.md`).
