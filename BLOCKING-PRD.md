# Product & Engineering PRD / Build Prompt

> **Purpose:** Convert the existing app (real prayer-blocking engine + mocked journal prototype) into the journaling product we scoped. This is written to sit alongside the existing **Blocking & Unblocking Logic** reference and reuse its terminology.
>
> **Status:** Target spec, 2026-06-30.
>
> **TL;DR:** Do **not** rebuild the blocking engine. Re-point the working DeviceActivity / ManagedSettings / App-Group engine (ref doc §1–4) away from the prayer trigger and onto a journaling trigger, and wire the journal UI (currently mocked, ref doc §5) to real `applyShields()` / `clearShields()` calls. The product change is a new lock model with two phases and a voice reflection as the unlock task.

---

## 0. Product summary (the one-paragraph pitch)

The app is a **shutdown ritual for your day**. Distraction apps are locked, and the only key that reopens your evening is a **60–120 second spoken reflection**. Voice is the point: it makes journaling fast enough to survive as a lock-task, where typing never could. The hero promise is **closure** — "close every day with intention." An optional daytime focus block is a supporting mode, not the headline.

### What is changing vs. today's build

- The lock trigger changes from **prayer due & unchecked** → **hasn't reflected today**.
- One prayer-shaped mechanic becomes **two phases**: an optional daytime **Focus** block and a core evening **Closure** gate that only a reflection unlocks.
- The journal UI's mocked blocking (ref §5) gets wired to the real bridge (ref §2).
- The compose flow becomes **voice-first** with adaptive prompts and a completion check.

### What is staying the same (do not touch)

- The entire native engine: FamilyControls / ManagedSettings / DeviceActivity, the two extensions, the App Group transport, and the `LockedIslamBridge` methods (ref §1–3).
- The two-lock-paths architecture (foreground effect + background extension kept in sync through App-Group `sharedState`).
- Identifiers (`group.com.lockedislam.shared`, `prayer.*` activity names, "DeenShield" strings). Keep these as-is for now — they're user-invisible, and renaming the App Group touches entitlements/provisioning. Ship the product first; rename in a later pass.
- User-facing copy uses the product's brand name (TBD — not yet decided) only.

---

## 1. The new lock model (core logic change)

Today: lock = a due prayer is unchecked. Replace with a **two-phase daily model**:

### Phase A — Focus block (OPTIONAL, daytime, time-driven)

- If the user enables Focus mode, distraction apps are shielded during `workStart`–`workEnd` (default 09:00–17:00, user-editable).
- **Not task-gated** — this is pure time-window shielding. It auto-locks at `workStart` and hands off to Phase B at `workEnd`.
- **Break budget:** the user gets `maxBreakPasses` passes/day (default 3), each worth `breakMinutes` (default 15). Spending a pass temporarily clears shields, then re-applies. This is the "friction, not punishment" escape hatch (ref §6, currently UI-only).

### Phase B — Closure gate (CORE, evening, task-driven)

- Starts at `reflectFromTime` (default = `workEnd`; if Focus mode is off, this is a standalone evening time, e.g. 21:00).
- From `reflectFromTime` until `journaledToday == true`, distraction apps stay shielded.
- Saving a reflection that passes the completion check → `journaledToday = true` → unlock for the rest of the night.
- At day rollover, `journaledToday` resets to false and apps are free again until the next `reflectFromTime`. An unfinished day is not punished into the next morning.

### How the phases combine

- **Focus ON:** windows are contiguous → one continuous lock from `workStart`, flipping at `workEnd` from auto/break-budgeted (Phase A) to reflect-to-unlock (Phase B). This is the "structured day" experience.
- **Focus OFF:** only Phase B exists → a clean evening journaling gate. This is the default hero experience and must work perfectly on its own.

### Important edge behaviors (specify these explicitly)

- **Journaling early:** if the user reflects before `reflectFromTime`, set `journaledToday = true` immediately. When the Closure window starts, it must **no-op** (see §3) rather than re-locking. Note: journaling early does **not** lift an active Focus block — Phase A is time-based and runs its course.
- **Never shield utilities.** Blocked set is user-chosen via the real picker, but onboarding copy steers toward social/entertainment and away from calls/maps/messages/work.
- **Rollover with no entry:** apps simply unlock at reset; no carry-over penalty.

**New mental model** (replaces ref §4's):

> Focus lock = "it's work hours and Focus mode is on." Closure lock = "the day isn't closed yet." The obligation is **reflecting**, and the check-off is **saving a spoken entry**.

---

## 2. State model changes (App-Group `sharedState`)

Keep the App Group and transport exactly as-is (ref §1). Remap the keys the extensions read:

| Old (prayer) | New (journal) | Notes |
|---|---|---|
| `prayed: {fajr:…}` | `journaledToday: bool` | Set true only after completion check passes. |
| `currentPrayer` | `lockPhase: 'focus' \| 'closure' \| null` | Which phase is active. |
| `lockActive` | `lockActive` | Unchanged. |
| `dayKey` | `dayKey` | Unchanged. |
| `selectedAppsCount` | `selectedAppsCount` | Unchanged. |
| — | `focusModeEnabled: bool` | New. |
| — | `workStart` / `workEnd` / `reflectFromTime` | New (HH:mm strings). |
| — | `breakPassesRemaining: int` / `maxBreakPasses` / `breakMinutes` | New. |
| — | `breakActiveUntil: iso \| null` | Non-null while a break is running. |

**Do NOT store journal content in `sharedState`.** The App-Group UserDefaults ~1MB cap (ref §2, storage monitor) is real. Only booleans/counters/times live there. Transcripts and audio live in the app's own encrypted store (§8).

---

## 3. Scheduling changes (DeviceActivity)

Replace the 5 prayer windows + `prefajr.reset` (ref §3) with:

| Activity name | Window | `intervalDidStart` | `intervalDidEnd` |
|---|---|---|---|
| `focus.block` (only if Focus ON) | `workStart`→`workEnd` | `applyShields`; `lockPhase='focus'` | Do not clear — hand off to closure. |
| `closure.gate` | `reflectFromTime`→pre-rollover | If `!journaledToday`: `applyShields`; `lockPhase='closure'`; fire "Close your day" local notification. Else no-op. | If `journaledToday` stays false to rollover, reset handles the unlock. |
| `break.end` (dynamic, one-shot) | `now+breakMinutes` | `applyShields` (re-lock after a break); clear `breakActiveUntil`. | — |
| `day.reset` | pre-rollover, 1 min | `clearAllSettings`; `journaledToday=false`; `breakPassesRemaining=maxBreakPasses`; new `dayKey`; `lockPhase=null`. | — |

- Reuse the existing "clear all schedules first, then register" pattern and the `reconfigureShields` helper verbatim.
- `break.end` is scheduled on demand when a pass is spent (see §6 Shield screen).
- Keep grace/clamp plumbing; it's harmless.

---

## 4. Foreground lock logic (replaces ref §4 effect)

In the journal equivalent of `TodayChecklistScreen`'s effect, derive:

```
inFocus    = focusModeEnabled && now ∈ [workStart, workEnd) && !breakActive
inClosure  = now ∈ [reflectFromTime, rollover) && !journaledToday
lockActive = inFocus || inClosure
lockPhase  = inFocus ? 'focus' : inClosure ? 'closure' : null
```

- lock → `authorizeScreenTime().finally(applyShields)`; unlock → `clearShields()`.
- Then `syncSharedStateWithRetry({...new keys})`.
- Preserve the 300ms debounce, the `lastShieldStateRef` skip, and the retry/alert-after-3 behavior. These exist to tame Screen-Time races — keep equivalents (ref §"sharp edges").

---

## 5. Extension changes

- **`DeviceActivityMonitorExtension`:** swap prayer callbacks for the §3 table. The unlock decision is now simply `journaledToday == true` (replacing `checkAllRequiredPrayersComplete`). Keep the App-Group read/write shape.
- **`ShieldConfigurationExtension`:** rewrite the block-screen copy per phase:
  - **Focus:** "Focused until {workEnd}. {breakPassesRemaining} breaks left." + a "Take a break" affordance if passes remain.
  - **Closure:** "One reflection opens your evening." + a "Reflect" affordance that deep-links into the voice flow.

---

## 6. User flow & screens (fine-tuning the prototype)

Reuse the `OrbApp` screens (ref §5); wire them to the real bridge and add voice.

### Onboarding (new, replaces mock `cats` toggles)

- Value-prop screen ("Close your day with intention").
- `authorizeScreenTime()` → `pickApps()` (real `FamilyActivityPicker`, not category booleans). Steer toward social/entertainment.
- Set schedule: `reflectFromTime` (required); Focus mode toggle → if on, `workStart` / `workEnd` + break budget.
- Notification permission (for the Closure nudge).

### Shield screen (`orb/screens/Shield.js`, currently static)

- Render phase-aware copy from `sharedState`.
- **Focus phase:** "Take a break" → decrement `breakPassesRemaining`, `clearShields()`, set `breakActiveUntil`, schedule `break.end`. Disable when passes = 0.
- **Closure phase:** "Reflect to unlock" → enters the reflection flow.

### Reflection flow (voice-first — the core new build)

**Feelings → Speak → Adaptive prompts → Tomorrow's intention → Save**

- Capture audio + transcribe (on-device preferred, §8). Show live transcript.
- Ask 1–3 prompts. MVP: a strong static prompt set. Adaptive/personalized prompts are v2 (needs entry history).
- End by capturing tomorrow's one intention (this is how the "productivity" problem is solved by the ritual, not by a second daytime blocker).
- On save → run completion check (§7) → set `journaledToday=true` → `clearShields()` → show a small payoff: a surfaced line from the entry + streak bump.

### Settings

- Edit schedule, Focus mode, break budget, blocked apps (re-invoke `pickApps()`), privacy controls (export/delete). Replace the mock `cats` object entirely.

---

## 7. The reflection & completion check (the hard product problem)

Journaling isn't machine-verifiable like steps/push-ups, and a resentful mumble is worth zero. The unlock must require **plausible engagement** without becoming an interrogation.

**MVP check (start lenient):**

- Minimum spoken duration (e.g. ≥ 20s of speech) and a minimal content signal (the transcript actually responds to the prompt vs. "unlock unlock unlock").
- If the first answer is thin, ask one adaptive follow-up; then pass regardless.
- Bias toward letting people through and reflecting effort back gently ("short one today — want to add anything?"), betting good prompts pull sincerity over time.

Instrument entry length / sincerity trend so you can tighten the check **only if** data shows gaming. Do not over-engineer this before launch.

---

## 8. Privacy & data (ship-blocker, not a later feature)

Voice journals are among the most intimate data a person can hand over; **trust is the product**.

- Prefer on-device transcription and storage; keep audio/transcripts in the app's own encrypted store, never in App-Group UserDefaults.
- No training on entries by default — explicit, plainly-worded opt-in only.
- One-tap export and delete. Make the privacy stance visible in onboarding, not buried.

---

## 9. Sharp edges to preserve (from ref §6) + one to fix

- **Authorization must precede shielding** — keep the `.approved` guard in `applyShields`.
- **Two lock paths must agree** via App-Group `sharedState` — keep both in sync.
- **App-Group ~1MB cap** — keep the storage monitor; store only small state there (§2).
- **Escape hatch is now real** — break passes (Phase A). Consider whether Closure needs a rare "skip tonight" pass too (open question, §11).
- **Fix / harden:** the module-level `shieldOperationInProgress` flag is shared between apply and clear, so a concurrent op is silently dropped. Break passes add a lot more apply/clear churn than the prayer app had — make this a small queue or separate guards so a break re-lock can't be swallowed by an in-flight clear.

---

## 10. Scope & instrumentation

### MVP (build the smallest thing that reveals the retention curve)

- Real onboarding (authorize + real picker + schedule).
- Phase B closure gate (evening reflect-to-unlock) wired to real shields — this alone is the product.
- Voice capture + transcription + static prompts + tomorrow's intention + lenient completion check + unlock payoff.
- Phase A focus block + break passes behind a toggle (default OFF, so the hero experience is clean).
- Day rollover reset. One real privacy commitment (on-device + delete).

### Out of scope for v1

- Adaptive/personalized prompts (v2, needs entry data).
- Morning intention as a separate gated flow (fold intention into the evening ritual for now).
- Identifier rename (`lockedislam`/DeenShield/App-Group) — cosmetic, later.
- Android (engine is Apple Screen Time only).

### Instrument from day one

- D1 / D7 / D30 retention.
- % of users who keep the lock enabled after week 1 — the key signal on whether the coercion is earning its place. If people only tolerate it briefly, pivot toward opt-in accountability.
- % who enable Focus mode (tells you if the "structured day" story is real or if Closure is the whole product).
- Entry length / completion-check pass rate over time.

---

## 11. Open decisions (need a call before/at build)

- **Closure rigidity:** hard block, or a rare paid/earned "skip tonight" escape valve?
- **Completion-check strictness** at launch (I recommend lenient — §7).
- **Default blocked categories** surfaced in onboarding.
- **Focus mode default:** ship OFF (recommended — keeps the hero clean) or ON?
- **`reflectFromTime` default** when Focus is off (e.g. 21:00?).

---

## Appendix — task checklist (usable as a coding-agent prompt)

- [ ] Point `App.js` at the journal entry (already the case) and delete/retire the mock blocking in `orb/controller.js`; replace mock state with the §2 keys sourced from the bridge.
- [ ] Onboarding: call `authorizeScreenTime()` + `pickApps()`; persist schedule + Focus config to `sharedState`.
- [ ] Port the `TodayChecklistScreen` foreground effect into the journal app with the §4 derivation (keep debounce + retry + operation-guard, hardened per §9).
- [ ] Rewrite `DeviceActivityMonitorExtension` schedules/callbacks per §3.
- [ ] Rewrite `ShieldConfigurationExtension` copy per phase (§5); deep-link "Reflect".
- [ ] Build the voice reflection flow (capture, transcribe, prompts, intention, save) + the completion check (§7) that sets `journaledToday=true` and calls `clearShields()`.
- [ ] Implement break passes: decrement, `clearShields`, `breakActiveUntil`, schedule `break.end` re-lock (§3/§6).
- [ ] Implement `day.reset` (§3).
- [ ] Privacy: on-device transcription + encrypted local store + export/delete (§8).
- [ ] Wire analytics events for the §10 metrics.
- [ ] Keep all `lockedislam` / DeenShield / App-Group identifiers unchanged; user-facing strings use the product's brand name (TBD — not yet decided).
