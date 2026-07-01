# Product & Engineering PRD / Build Prompt

> **Purpose:** Convert the existing app (real prayer-blocking engine + mocked journal prototype) into the journaling product we scoped. Written to sit alongside the existing **Blocking & Unblocking Logic** reference and reuse its terminology.
>
> **Status:** Target spec, 2026-07-01.
>
> **TL;DR:** Do **not** rebuild the blocking engine. Re-point the working DeviceActivity / ManagedSettings / App-Group engine (ref doc §1–4) away from the prayer trigger and onto a **morning-journal** trigger, and wire the journal UI (currently mocked, ref doc §5) to real `applyShields()` / `clearShields()` calls. The product is a **mandatory morning intention-journal** that unlocks the phone, plus an optional, user-initiated **"lock in"** focus mode.

---

## 0. Product summary (the one-paragraph pitch)

The app is a **morning launch ritual**. On waking, distraction apps are locked, and the only key that opens the day is a **60–120 second spoken morning journal** — thinking through the day ahead and what you want to accomplish. Doing it unlocks your apps for the day. If you want to go further, you can **"lock in"**: a voluntary focus session that re-blocks distractions so you can do deep work. Voice is the point — it makes journaling fast enough to survive as a lock-task, where typing never could.

**Target user:** people who want more discipline and to be more successful, who've heard journaling helps but never stuck with it. Aspirational self-improvers, not committed journalers. The value prop is **enforcement** — the app makes the habit happen, then rewards it with a clear, focused day.

**Hero promise:** "Start every day with intention. Earn your day."

**Tone:** discipline / self-improvement (not calm-wellness). Closer to a hardcore focus tool than to Headspace.

### What is changing vs. the previous (evening) draft

- The gate moves from evening reflection to a **mandatory morning intention journal**.
- The journal content becomes **intention/planning** ("what do I want today to be"), not reflection on a day that hasn't happened.
- The two-phase Focus/Closure model is replaced by: (A) a mandatory morning gate, and (B) an optional, user-triggered lock-in session.
- **No to-do list / task gate.** Journaling alone unlocks the day. (Removed: the weak "check 3 boxes to unlock" mechanic.)

### What is staying the same (do not touch)

- The entire native engine: FamilyControls / ManagedSettings / DeviceActivity, both extensions, the App Group transport, and the `LockedIslamBridge` methods (ref §1–3).
- The two-lock-paths architecture (foreground effect + background extension kept in sync through App-Group `sharedState`).
- Identifiers (`group.com.lockedislam.shared`, `prayer.*` activity names, "DeenShield" strings). Keep as-is for now — user-invisible, and renaming the App Group touches entitlements/provisioning. User-facing copy uses the product's brand name (TBD — not yet decided) only.

---

## 1. The lock model (core logic)

Two independent mechanisms. One is mandatory and gates the day; the other is opt-in.

### Phase A — Morning Gate (MANDATORY, the core mechanic)

- At day start, distraction apps are shielded by default and stay shielded until the user completes the morning journal (passes the completion check, §7).
- Completing the journal → `journaledToday = true` → unlock for the rest of the day.
- **No hard deadline / no guillotine.** The user stays locked until they journal — whenever that is. Journal at 7am → full free day ahead; journal at 2pm → you've already spent your morning locked. The clock is the consequence, not an artificial all-day punishment. This is deliberate: it keeps real teeth (you can't touch your apps until you do it) without the "one rushed morning bricks my whole day" failure that drives uninstalls.
- **Utilities are never shielded** (calls, maps, messages, work) — a locked morning never means "can't function."

### Phase B — Lock In (OPTIONAL, user-initiated focus session)

- A button the user taps to voluntarily re-block distraction apps for a chosen duration (a set number of hours, or "for the rest of the day") to do focused work.
- Surfaced as a choice at the end of the morning journal ("Unlock my day" vs. "Lock in for the day") and available any time from the home screen afterward.
- Optional break allowance inside a lock-in session (e.g. N short breaks) as a "friction, not punishment" escape hatch — see §11 open decision.

### How they combine

- **Default day:** locked on wake → journal → unlocked all day. Simple.
- **Power day:** locked on wake → journal → choose Lock In → blocked again for focused work until the session ends or the user ends it (subject to break allowance).
- The two never fight: Phase A is "locked until journaled," Phase B is "locked because I chose to." Either can hold the shield; releasing requires the relevant condition.

**Mental model** (replaces ref §4's):

> Morning-gate lock = "the day isn't started yet — I haven't set my intentions." Lock-in = "I've chosen to focus." The obligation is **journaling**; the check-off is **saving a spoken morning entry**.

---

## 2. State model changes (App-Group `sharedState`)

Keep the App Group and transport exactly as-is (ref §1). Remap the keys the extensions read:

| Old (prayer) | New (journal) | Notes |
|---|---|---|
| `prayed: {fajr:…}` | `journaledToday: bool` | Set true only after completion check passes. Unlocks the day. |
| `currentPrayer` | `lockPhase: 'morningGate' \| 'lockIn' \| null` | Which mechanism is holding the shield. |
| `lockActive` | `lockActive` | Unchanged. |
| `dayKey` | `dayKey` | Unchanged. |
| `selectedAppsCount` | `selectedAppsCount` | Unchanged. |
| — | `dayStartTime` | HH:mm the morning gate engages (default 05:00). |
| — | `lockInActive: bool` / `lockInUntil: iso \| null` | State of an optional focus session. |
| — | `breakPassesRemaining` / `maxBreakPasses` / `breakMinutes` | Only if lock-in breaks are shipped (§11). |

**Do NOT store journal content in `sharedState`.** The App-Group UserDefaults ~1MB cap (ref §2) is real. Only booleans/counters/times live there. Transcripts/audio live in the app's own encrypted store (§8).

---

## 3. Scheduling changes (DeviceActivity)

Replace the 5 prayer windows + `prefajr.reset` (ref §3) with:

| Activity name | Window | `intervalDidStart` | `intervalDidEnd` |
|---|---|---|---|
| `day.reset` | at `dayStartTime`, 1 min | `journaledToday=false`; `applyShields` (gate engages); `lockPhase='morningGate'`; reset break passes; new `dayKey`; fire "Set your intentions to start your day" notification. | — |
| `lockin.session` (dynamic, user-initiated) | `now` → chosen end | `applyShields`; `lockInActive=true`; `lockPhase='lockIn'`. | `clearShields` (if morning gate already satisfied); `lockInActive=false`. |
| `break.end` (dynamic, optional) | `now+breakMinutes` | `applyShields` (re-lock after a lock-in break). | — |

- Note the **key inversion vs. the prayer app**: `day.reset` now `applyShields` instead of clearing — a new day starts locked until journaled.
- The morning gate itself needs no repeating window beyond `day.reset` engaging it; the unlock happens on journal-save via the foreground effect (§4).
- Reuse the "clear all schedules first, then register" pattern and the `reconfigureShields` helper verbatim.

---

## 4. Foreground lock logic (replaces ref §4 effect)

In the journal equivalent of `TodayChecklistScreen`'s effect, derive:

```
gateLocked   = !journaledToday && now >= dayStartTime
lockInLocked = lockInActive && now < lockInUntil && !breakActive
lockActive   = gateLocked || lockInLocked
lockPhase    = gateLocked ? 'morningGate' : lockInLocked ? 'lockIn' : null
```

- lock → `authorizeScreenTime().finally(applyShields)`; unlock → `clearShields()`.
- Then `syncSharedStateWithRetry({...new keys})`.
- Preserve the 300ms debounce, the `lastShieldStateRef` skip, and the retry/alert-after-3 behavior (Screen-Time race protection — ref §"sharp edges").

---

## 5. Extension changes

- **`DeviceActivityMonitorExtension`:** swap prayer callbacks for the §3 table. The morning unlock decision is simply `journaledToday == true` (replacing `checkAllRequiredPrayersComplete`). Keep the App-Group read/write shape.
- **`ShieldConfigurationExtension`:** rewrite the block-screen copy per phase:
  - **Morning gate:** "Start your day. One quick journal opens your apps." + a "Journal" button that deep-links into the voice flow.
  - **Lock-in:** "You're locked in. {timeRemaining} left." + a break affordance if breaks ship.

---

## 6. User flow & screens

Reuse the `OrbApp` screens (ref §5); wire them to the real bridge and add voice.

### Onboarding (replaces mock `cats` toggles)

- Value-prop screen ("Start every day with intention").
- `authorizeScreenTime()` → `pickApps()` (real `FamilyActivityPicker`, not category booleans). Steer toward social/entertainment; away from utilities.
- Set `dayStartTime` (when the gate engages each morning).
- Notification permission (for the morning nudge).

### Home screen

- **If gated:** prominent state ("Your day is locked — journal to begin") + start-journal CTA.
- **If unlocked:** streak, today's intention (surfaced from the entry), and a "Lock In" CTA.

### Morning journal flow (voice-first — the core new build)

**Prompt → Speak → (optional 1 follow-up) → Save**

- Capture audio + transcribe (on-device preferred, §8). Show live transcript.
- Intention prompts (MVP: strong static set), e.g. "What do you want today to be?", "What's the one thing that would make today a win?", "What might get in your way?"
- On save → run completion check (§7) → `journaledToday=true` → `clearShields()` → payoff: a surfaced line from the entry + streak bump → then the choice: "Unlock my day" or "Lock in for the day."

### Lock-in flow

- Pick a duration (or "rest of day") → `applyShields` + `lockInActive`/`lockInUntil` + schedule `lockin.session` end. Optional break passes during the session (§11).

### Settings

- Edit `dayStartTime`, blocked apps (re-invoke `pickApps()`), lock-in defaults, privacy controls (export/delete). Replace the mock `cats` object entirely.

---

## 7. The journal & completion check

The morning journal is the gate, so it needs some teeth — but a resentful mumble at 6am is worth zero, and this audience wants the enforcement, so bias toward a check that's **real but not an interrogation**.

**MVP check (start lenient):**

- Minimum spoken duration (e.g. ≥ 20s of speech) and a minimal content signal (the transcript actually engages the prompt vs. "unlock unlock unlock").
- If the first answer is thin, ask one follow-up prompt; then pass regardless.
- Reflect low effort back gently rather than blocking ("short one — want to add anything?").

Instrument entry length / pass rate so the check can be tightened **only if** data shows gaming. Don't over-engineer pre-launch.

---

## 8. Privacy & data (ship-blocker)

Voice journals are intimate; **trust is the product**.

- Prefer on-device transcription and storage; audio/transcripts in the app's own encrypted store, never in App-Group UserDefaults.
- No training on entries by default — explicit, plainly-worded opt-in only.
- One-tap export and delete, visible in onboarding.

---

## 9. Sharp edges to preserve (ref §6) + one to fix

- **Authorization must precede shielding** — keep the `.approved` guard in `applyShields`.
- **Two lock paths must agree** via App-Group `sharedState`.
- **App-Group ~1MB cap** — keep the storage monitor; only small state there (§2).
- **`day.reset` now applies rather than clears shields** — double-check the extension does the inverse of the prayer app here; easy to get backwards.
- **Fix / harden:** the module-level `shieldOperationInProgress` flag is shared between apply and clear, so a concurrent op is silently dropped. Lock-in start/stop + optional breaks add apply/clear churn — make this a small queue or separate guards so a re-lock can't be swallowed by an in-flight clear.

---

## 10. Scope & instrumentation

### MVP

- Real onboarding (authorize + real picker + `dayStartTime`).
- Morning gate wired to real shields (`day.reset` applies; journal-save clears).
- Voice capture + transcription + static intention prompts + lenient completion check + unlock payoff.
- The post-journal Unlock / Lock-In choice + a basic lock-in session (fixed duration).
- One real privacy commitment (on-device + delete).

### Out of scope for v1

- Adaptive/personalized prompts (v2, needs entry data).
- Lock-in break passes (ship only if §11 says so).
- To-do lists / task verification (removed by design).
- Identifier rename; Android (Apple Screen Time only).

### Instrument from day one

- D1 / D7 / D30 retention.
- Morning gate completion rate and time-from-wake-to-journal — the core behavior signal. If people routinely fail to complete or journal very late, the morning gate is fighting them and you revisit timing.
- % who use Lock-In, and whether it correlates with retention (tells you if the focus feature earns its place).
- Completion-check pass rate / entry length over time.

---

## 11. Open decisions (need a call before/at build)

- **`dayStartTime` default** (when the gate engages each morning — 05:00? user's wake time?).
- **Completion-check strictness** at launch (recommend lenient — §7).
- **Skip token:** ship a scarce "life happens" pass (e.g. 1–2/month, non-rolling) that unlocks a day without journaling for genuine emergencies? Removes the "sick and phone is bricked" horror story; scarcity stops it becoming the default. Recommend: yes, minimal.
- **Lock-in breaks:** allow N short breaks inside a lock-in session, or make lock-in all-or-nothing until it ends?
- **Lock-in max duration / early-exit:** can the user end a lock-in early, or is it committed once started?
- **Default blocked categories** surfaced in onboarding.

---

## Appendix — task checklist (usable as a coding-agent prompt)

- [ ] Retire the mock blocking in `orb/controller.js`; replace mock state with the §2 keys sourced from the bridge.
- [ ] Onboarding: `authorizeScreenTime()` + `pickApps()`; persist `dayStartTime` + blocked apps.
- [ ] Port the `TodayChecklistScreen` foreground effect into the journal app with the §4 derivation (keep debounce + retry + operation-guard, hardened per §9).
- [ ] Rewrite `DeviceActivityMonitorExtension` schedules/callbacks per §3 — note `day.reset` applies shields, not clears.
- [ ] Rewrite `ShieldConfigurationExtension` copy per phase (§5); deep-link "Journal".
- [ ] Build the voice morning-journal flow (capture, transcribe, intention prompts, save) + the completion check (§7) that sets `journaledToday=true` and calls `clearShields()`.
- [ ] Build the post-journal Unlock / Lock-In choice + lock-in session (`applyShields`, `lockInActive`/`lockInUntil`, schedule `lockin.session` end). Optional breaks per §11.
- [ ] Implement `day.reset` (§3) — resets and re-engages the gate.
- [ ] Privacy: on-device transcription + encrypted local store + export/delete (§8).
- [ ] Wire analytics events for the §10 metrics.
- [ ] Keep all `lockedislam` / DeenShield / App-Group identifiers unchanged; user-facing strings use the product's brand name (TBD).
