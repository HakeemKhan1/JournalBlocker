# Journal — design prototype (`src/journal/`)

A simple journaling app with an Apple-native feel, built on the forked
DeenShield blocking engine. iOS HIG styling: systemGroupedBackground, inset
grouped lists, SF-style system type, monochrome SF-Symbol-like icons (Ionicons),
one warm tint + an indigo "AI" accent. No emoji. Runs on iOS, Android, Expo web.

## Run / screenshot
```bash
cd journal-blocker/app
npm install          # first time
npm run web          # browser preview
# headless screenshots of every screen:
npx expo export --platform web --output-dir dist-web && node /tmp/shot.js  # see /tmp/shots
```
`App.js` renders `PrototypeApp`.

## Architecture
- **Onboarding** — clean intro, then voice / blocking / privacy. Pages cross-fade
  and slide. Replayable from Settings.
- **Home** (single scrolling dashboard):
  1. **Insights** preview (stat cards) → *See All* → full Insights.
  2. **Blocked Apps** preview → *See All* → categories (toggles) + apps + rules.
  3. **Journals** — All Entries + each journal, **+** to create one.
- **Add Journal** sheet — pick an icon (32 options) + color, name it, live preview.
- **Journal Detail** — entries grouped Today / This Month / Earlier, segmented
  filter, compose button; tap an entry to **view / edit / delete**.
- **Compose** sheet — voice-first: simulated dictation + **Polish with AI**;
  journal + mood pickers.
- **Shield** — clean mock of the iOS block screen → Compose.
- **Settings** sheet — reminders, streak freeze, plus prototype shortcuts.

Navigation is a small custom animated stack (`nav/Stack.js`, iOS slide); sheets
are RN Modals — keeps it predictable on web without a heavy nav dependency.

## Real vs mocked
Real: all UI, components, navigation, transitions. Mocked: speech-to-text + AI
text (canned), data (`data/mockState.js`), Screen Time + actual blocking.

## "Use real Apple components" note
This emulates UIKit/SwiftUI faithfully in React Native so it previews on web.
For a shipping iOS build, these components map cleanly onto true SwiftUI
(`@expo/ui`) / native — same layout, same tokens.

## Not wired yet (the real risk — do next)
The journal-completion **unlock round-trip** through the native engine
(`App.prayer.reference.js`, `ios/.../LockedIslamBridge.swift`,
`DeviceActivityMonitorExtension.swift`): swap the prayer "all prayers prayed"
unlock for a `journaledToday` flag in the App Group, deep-link the shield CTA
into Compose. Needs a real device (SPEC §5, §13).
