# Journal Blocker — Product Spec (v0.1 draft)

> **Status:** Draft for review. Created 2026-06-12.
> **Owner:** Hakeem
> **One-liner:** An iOS app that blocks your distracting apps until you write a journal entry — turning the urge to scroll into a daily journaling habit.

---

## 0. How to read this spec
This is a layered spec. Skim sections 1–3 to align on *what we're building and why*. Sections 4–7 are the build contract (flows, data, screens, technical constraints). Section 8 is everything deliberately cut from v1. Anything marked **[ASSUMPTION]** is my guess and needs your confirmation — replace with facts from your existing GPT project notes.

---

## 1. Problem & goal

**Problem.** People reach for distracting apps (social, news, games) reflexively. They also *want* to journal but never build the habit — there's no trigger and no friction redirect.

**Insight.** The moment someone reaches for a distracting app is the highest-intent moment to redirect them. If opening Instagram requires first writing two sentences of reflection, we convert a distraction trigger into a journaling trigger.

**Goal (v1).** Get a user to journal once per day for 7 consecutive days by using "blocked apps" as the forcing function.

**Non-goals (v1).** Rich text editor, social sharing, AI analysis of entries, Android, web.

---

## 2. Success metrics
- **North star:** % of active users who journal ≥1×/day.
- **Activation:** user completes onboarding + writes first entry + sets at least one blocked app within first session.
- **Retention:** D7 retention; current journaling streak length.
- **Guardrail:** uninstall rate / "disabled blocking" rate — if blocking feels punitive, people bail.

---

## 3. Target user & core principle
**[ASSUMPTION]** Primary user: a productivity-minded person (likely 18–35) who already wants to journal and is frustrated by phone distraction.

**Core design principle:** *Friction, not punishment.* The block should feel like a gentle gate that's trivially satisfied by doing the thing you wanted to do anyway (journal), never like being locked out of your own phone. Escape hatches must exist so the app is trusted, not deleted.

---

## 4. Core mechanic & flows

### 4.1 The core loop
1. User selects which apps/categories to block and the **unlock condition** (e.g., "write 1 entry of ≥ 50 words").
2. Blocking is active on a schedule (e.g., all day, or work hours, or until first entry of the day).
3. User taps a blocked app → iOS shows our **"shield"** screen instead of the app.
4. Shield screen has one CTA: **"Journal to unlock."**
5. User writes an entry meeting the condition.
6. On completion → apps unlock for a configurable window (e.g., until tomorrow, or for X minutes).
7. Streak increments; user gets positive reinforcement.

### 4.2 Key flows to spec in detail
- **Onboarding:** value prop → request Screen Time permission → pick apps to block → set unlock rule → write first entry (guided prompt). 
- **Daily journal-to-unlock:** the loop above.
- **Free journaling (no block pending):** user opens app voluntarily to write; should be just as easy.
- **Streak & history:** calendar/list of past entries, current streak, longest streak.
- **Escape hatch:** "I need access now" — e.g., a 60-second cooldown, or limited free passes per week. Prevents the trust-breaking lockout. **[DECISION NEEDED]**

### 4.3 The center button + voice Q&A (PRIMARY interaction)
This is the signature interaction of the app.

- The **Home / Today** screen has one large **center button** ("the orb"). Tapping it starts a journaling session.
- The session serves **3 questions, one at a time**, pulled from a **question bank stored in the DB** (questions are arbitrary/editable content, not hardcoded).
- Each question is answered **by voice** — Whisper-style speech-to-text dictation transcribes the spoken answer to text live.
- Flow per question: show question → user taps to start recording (or auto-listen) → speak → transcript appears → confirm/edit → **Next** → next question.
- After the 3rd answer → session saved as one **JournalEntry** (3 Q/A pairs) → streak increments → **apps unlock**.

**Question selection [DECISION NEEDED]:** how are the 3 chosen? Options:
- Random 3 from the bank each session.
- Fixed daily set (everyone gets the same 3 today).
- Sequential / rotating so you don't repeat until the bank is exhausted.
- **[ASSUMPTION] v1 default:** random 3, no repeats within the same day.

**Transcription engine [DECISION NEEDED — see §5.1]:** "whisperflow" could mean (a) Apple's on-device Speech framework, (b) OpenAI Whisper / a hosted Whisper API, or (c) the Wispr Flow product. These differ a lot on cost, offline support, and privacy. Confirm which you mean.

### 4.4 Unlock rule (derived from the Q&A)
- **v1 default:** completing all **3 voice answers** (each non-empty transcript) = unlock. Simple and tied directly to the core interaction.
- Optional stricter variants for later: min words per answer, or min total speaking time.

---

## 5. iOS technical constraints (read this before estimating)

Blocking other apps on iOS is **only** possible via Apple's frameworks — you cannot do it from a normal app or the web:

- **FamilyControls** — user authorization + the app/category picker (`FamilyActivityPicker`). The user, not us, sees real app names; we get opaque tokens.
- **ManagedSettings** — applies the actual "shield" over selected apps.
- **DeviceActivity** — schedules when blocking is active and runs logic at interval boundaries (a separate app extension, limited runtime).
- **ShieldConfiguration extension** — customizes the block screen ("Journal to unlock").

**Hard requirements / gotchas:**
- Requires the **Family Controls entitlement** from Apple — must be requested and approved (can take time; plan for it early). **[ACTION: apply ASAP]**
- App extensions run in a **sandboxed, memory-limited** context — the journaling UI itself runs in the main app; the shield extension can only show a screen and trigger opening our app.
- We get **tokens, not app identities** — we can't read "they opened Instagram," only that a shielded app was tapped. Design analytics around that limit.
- Likely **iOS 16+** for the modern Screen Time API surface. **[CONFIRM target iOS version]**
- Real-device testing required; Screen Time APIs are flaky/limited in the simulator.

**Implication for the spec:** the unlock flow is *shield extension → deep-link into main app → complete the 3-question voice session → main app clears the ManagedSettings shield*. Build a thin technical spike of exactly this round-trip before committing to full UI.

### 5.1 Speech-to-text ("whisperflow") options
Affects cost, latency, offline use, and privacy — decide before building the Q&A screen.

| Option | Offline? | Cost | Privacy | Notes |
|---|---|---|---|---|
| **Apple Speech framework** (`SFSpeechRecognizer`; `SpeechAnalyzer`/`SpeechTranscriber` on iOS 26+) | On-device on newer devices | Free | Best (stays on device) | Native, no API keys, lower friction. **Recommended for v1.** |
| **OpenAI Whisper API** (hosted) | No (needs network) | Per-minute API cost | Audio leaves device | Very accurate; adds backend + key management + per-use cost. |
| **Whisper on-device** (e.g. whisper.cpp / CoreML) | Yes | Free after bundling model | Best | Larger app size, more engineering, battery cost. |
| **Wispr Flow** (the product) | n/a | n/a | n/a | It's a standalone dictation app — not an embeddable SDK for a 3rd-party iOS app. Likely **not** what we can integrate; flag if you actually meant this. |

**[ASSUMPTION] Recommendation:** start with **Apple's Speech framework** (free, on-device, no backend, lowest friction). Swap to Whisper later only if accuracy is a problem. Requires `Speech` + `Microphone` usage permissions.

---

## 6. Data model (v1, local-first)
Local-first (on-device) is fine for v1; add sync later.

- **Question**: id, text, isActive, category (nullable), orderIndex (nullable), createdAt. *The arbitrary, DB-stored question bank that feeds the 3-question session; editable without an app update.*
- **JournalEntry**: id, createdAt, durationSeconds, unlockedSessionId (nullable). Has 3 child **Answer**s.
- **Answer**: id, entryId, questionId, questionTextSnapshot (store the question text as-shown, so edits to the bank don't rewrite history), transcriptText, audioDurationSeconds, wasEdited (bool).
- **BlockConfig**: id, selection (FamilyControls token set), schedule, unlockRule, unlockWindow.
- **UnlockSession**: id, triggeredAt, satisfiedByEntryId, expiresAt.
- **StreakState**: currentStreak, longestStreak, lastEntryDate.
- **Settings**: notification prefs, escape-hatch allowance, theme.

**[DECISION NEEDED]** Storage: SwiftData (modern, iOS 17+) vs Core Data (broader support). Recommend **SwiftData** if we target iOS 17+.

---

## 7. Screens (v1)
1. **Onboarding** (3–4 cards) → Screen Time permission → **mic + speech permission** → app picker → first session.
2. **Home / Today** — the large **center button ("the orb")** as the primary CTA, current streak, blocking status. Tapping the orb starts the voice Q&A session.
3. **Voice Q&A session screen** — shows one question at a time (of 3), a record/listening indicator, the live transcript, confirm/edit, and a Next/progress (1 of 3) control. Final answer saves the entry and unlocks.
4. **Shield screen** (extension) — "These apps are blocked. Journal to unlock." + CTA that deep-links to writing screen.
5. **History** — calendar/list of entries + streak stats.
6. **Settings** — blocked apps, schedule, unlock rule, escape hatch, notifications, **manage question bank** (add/edit/disable questions).

---

## 8. Out of scope for v1 (backlog)
- Cloud sync / multi-device, accounts.
- AI reflection, sentiment, summaries.
- Rich media (photos, audio) in entries.
- Social / accountability partners.
- Android, iPad-optimized, web companion.
- Custom shield themes.

---

## 9. Open decisions (need your input)
1. **Escape hatch** design — passes/week? cooldown timer? none?
2. **Unlock window** — unlock for the rest of the day, or only N minutes?
3. **Default unlock rule** — confirm "1 prompt, ≥1 sentence."
4. **Min iOS version / SwiftData vs Core Data.**
5. **Anything from your existing GPT project** that contradicts or extends the above — paste it in and I'll merge.

---

## 11. Retention & engagement

The retention strategy must respect the core principle (**friction, not punishment**). Our unfair advantage is that the *blocker itself is a daily trigger* — most journaling apps beg for attention; ours is summoned every time the user reaches for a distraction. Lean into that.

### 11.1 The retention engine — how the loop self-reinforces
Map every feature to a stage of the habit loop (cue → routine → reward → investment):
- **Cue:** the block shield is the cue (external + high-intent). Plus one well-timed daily notification as a backup cue.
- **Routine:** the 3-question voice session — kept short (≤ ~60s) on purpose so it never feels like a chore.
- **Reward:** *variable* reward (see 11.3), not the same screen every time.
- **Investment:** each entry deepens a personal archive the user won't want to abandon (sunk-cost in a good way).

### 11.2 Streaks done right (and their failure mode)
- Show **current streak + longest streak** prominently; streaks are the single strongest journaling-retention lever.
- **Streak insurance / freeze:** 1–2 "freeze" tokens so a single missed day doesn't nuke a 60-day streak. Losing a long streak to one bad day is the #1 cause of rage-quitting habit apps — protect against it.
- **Grace window:** count "today" generously (e.g., entry before 4am still counts for the prior day).
- Avoid weaponizing guilt — frame a broken streak as "start a new one" not "you failed."

### 11.3 Variable reward (the anti-boredom mechanism)
Sameness kills journaling apps. Introduce controlled novelty:
- **Rotating question bank** so the 3 questions feel fresh; seasonal/themed packs as content drops.
- **Occasional surprise after a session:** a resurfaced past answer ("One year ago you said…"), a streak milestone animation, an unlocked question pack, or a one-line affirmation. Make it *sometimes*, not every time — unpredictability is what sustains interest.
- **Question packs** as a content pipeline (gratitude, focus, relationships, founder-mode, etc.) — cheap to ship since questions are just DB rows.

### 11.4 The "look back" payoff (long-term hook)
The compounding value of journaling is rereading it. Build this early, not late:
- **"On this day" / time-capsule resurfacing** of past entries.
- **Weekly/monthly recap** ("you journaled 5 of 7 days; here's a highlight").
- **Searchable, beautiful archive.** The bigger the archive, the higher the switching cost — this is the real long-term moat.

### 11.5 Notifications (earn the right to send them)
- One smart daily nudge at the user's chosen time; respect quiet hours.
- Trigger-based, not nagging: "Ready to unlock your day? 3 questions, 60 seconds." 
- Streak-at-risk reminder in the evening *only if* they haven't journaled and have a streak to protect.
- Never more than ~1–2/day in v1; over-notifying is a top uninstall cause.

### 11.6 Anti-patterns to avoid
- Hard lockouts with no escape hatch (breaks trust → uninstall).
- Same prompt every day (boredom).
- Guilt-based copy.
- Demanding long entries (raises friction; voice + short answers is the whole point).
- Dark-pattern streak pressure.

### 11.7 Metrics to instrument for retention
- Streak distribution; streak-freeze usage; % returning after a broken streak.
- Session completion rate (start orb → all 3 answered) and drop-off per question.
- Time-to-complete a session (watch for it creeping up = friction).
- Notification → session conversion.
- Archive revisits (do people reread old entries?).

---

## 12. Psychologically engaging onboarding

Onboarding's job: get the user to **one completed voice session + blocking enabled** before they lose interest, while making them *feel* the unique value. Order matters — earn buy-in before asking for scary permissions.

### 12.1 Principles
- **Show the magic before asking for permissions.** Let them feel the voice Q&A first; request Screen Time *after* they want it.
- **Personalize early** — a 2–3 tap "what do you want from this?" makes the app feel built for them and primes commitment.
- **Commitment & consistency** — have them state a goal ("journal daily for a week"); a stated intention raises follow-through.
- **First win fast** — the very first session is guided and frictionless so they finish it and feel the dopamine.
- **Reduce permission anxiety** — explain *why* right before each ask, in plain language ("We block apps with Screen Time so you can't accidentally bypass — your data never leaves your phone").

### 12.2 Recommended onboarding flow (specced)
1. **Hook — animated intro (the signature opener).** Not a text promise — a short **animated video/motion sequence** that plays on first launch and sets the emotional tone of the app. Goal: make the user *feel* the transformation (restless scrolling → calm, intentional reflection) in a few seconds, before any words or asks.
   - **Length:** ~6–12s. Long enough to land, short enough to never block someone twice.
   - **Narrative beat:** tension (the doom-scroll pull / cluttered mind) → the orb appears → release (calm, a spoken thought becoming words). Mirrors the core loop so the hook *is* the value prop, shown not told.
   - **Skippable** after ~2s (always-visible Skip), and **plays only on first launch** (re-watchable from Settings). Never force returning users through it.
   - **Sound:** subtle audio/music that respects the silent switch; works fully muted (it's visual-first). Optional one-line on-screen caption at the end + Start button.
   - **Technical [DECISION NEEDED]:** how is it built/shipped? Options — (a) **Lottie/Rive** vector animation (tiny file, crisp at any size, themeable; recommended), (b) a bundled **MP4/HEVC video** (richest visuals, larger app size, no live theming), or (c) **native SwiftUI motion** (most control, most dev time). Recommend **Lottie/Rive** for size + polish unless we want cinematic footage.
   - **Asset dependency:** requires a designer/motion artist — add to the critical path; the hook is a brand moment, not an afterthought.
2. **Personalization (2–3 taps)** — "What's pulling your attention?" (social / news / games) and "What do you want more of?" (focus / calm / gratitude). Feeds default blocked-app suggestions and the question pack.
3. **Feel the magic (no permissions yet)** — a guided **first voice session**: one warm, easy question, user speaks, sees their words transcribe in real time. This is the aha moment; protect it. (Mic permission requested here, framed as "to hear you.")
4. **Commitment** — "Pick your goal" (e.g., 7-day streak) → sets the streak target and primes consistency.
5. **The deal / value framing** — "From now on, your distracting apps stay closed until you answer 3 quick questions. Ready to set it up?" Now they *want* the blocker.
6. **Screen Time permission** — explained in-context, immediately before the system prompt.
7. **"Set up your day" — app selection** — the commitment moment. See §14 for the full design (guided category framing → system picker). Ends onboarding on an action, not a settings chore.
8. **Done / activated** — celebratory confirmation, show the orb, set first notification. They're now in the loop.

### 12.3 Onboarding guardrails
- Keep it under ~90 seconds to the first completed session.
- Every permission ask is preceded by a plain-language "why" screen (raises grant rate, lowers anxiety).
- Allow "skip blocking for now" so a hesitant user can still journal — capture them, convert to blocking later.
- A/B test: magic-first vs goal-first ordering; measure activation (completed first session + blocking enabled).

---

## 14. App selection & recommended starter blocklist

The final onboarding step is **"Set up your day"** — the user chooses what to block, which doubles as their first daily commitment. This is also the model for an optional daily morning ritual later.

### 14.1 The iOS constraint (important — shapes the whole design)
We **cannot** programmatically pre-check "Instagram" for the user. Apple's `FamilyActivityPicker` is privacy-walled: the user picks apps/categories inside Apple's own UI, and we only ever receive **opaque tokens** afterward — we can't read app names or pre-select specific apps/categories on first run. So "start them on the worst categories" can't be a literal auto-selection through the system picker.

**Therefore the flow is two steps:**
1. **Our framing screen (we fully control this):** a short list of *our own* distraction categories with our copy/icons and **recommended ones pre-toggled ON**. This primes intent and does the persuading.
2. **Apple's `FamilyActivityPicker`:** launched right after, with coaching copy ("Select the categories you just chose"). The user makes the actual selection; we store the returned token set as their `BlockConfig`.

The framing screen is where we "recommend the worst offenders." The picker is where it becomes real. (On later edits we *can* re-present the picker pre-populated with their saved selection — pre-selection only fails on the very first run.)

### 14.2 Both granularities
Offer **categories** (broad, low-effort, recommended default) *and* **individual apps** (precision, for power users). Most users should be able to finish with category toggles alone; individual-app picking is the "customize" path.

### 14.3 Recommended starter blocklist (tuned for the target generation)
Target user skews young (≈16–28). Rank by attention-harm × prevalence, and **default-ON only the high-harm/low-utility categories** — over-blocking utilities is a top uninstall cause.

| Category | Examples | Default | Why |
|---|---|---|---|
| **Short-form video** | TikTok, Instagram Reels, YouTube Shorts | **ON** | The #1 attention sink for this generation — infinite-scroll, most addictive, lowest real utility. The flagship block. |
| **Social media** | Instagram, Snapchat, X, Facebook | **ON** | High compulsive-checking, comparison/anxiety driver. |
| **Games** | mobile games | **ON** | High time-sink, easy to default-block without breaking essential function. |
| **News / doomscroll** | Reddit, news apps, X (overlap) | Optional (off) | Genuinely problematic but some users rely on it; let them opt in. |
| **Entertainment / streaming** | YouTube (main), Netflix | Optional (off) | Time-sink but also intentional use; opt-in. |
| **Shopping** | Amazon, retail apps | Optional (off) | Impulse-spend trigger for some; niche. |
| **Dating** | Tinder, Hinge, etc. | Optional (off) | Compulsive for some; sensitive — never default-on. |
| **Messaging** | WhatsApp, Messenger, iMessage | **OFF (do not recommend)** | High *utility* — blocking comms breaks trust and drives uninstalls. Available to pick, never recommended. |

**Default recommendation = Short-form video + Social media + Games pre-toggled ON**; everything else opt-in. Phrase it as a smart starting point they can adjust, not a mandate.

### 14.4 Copy / framing
- Lead with the benefit, not restriction: *"Pick what steals your focus. We'll keep it closed until you've journaled."*
- Show the recommended set already on, with a one-tap "use recommended" and easy deselect — autonomy lowers resistance.
- Reassure on privacy at the picker: *"Apple handles this selection privately — we never see which specific apps you choose."* (True, and it lowers permission anxiety.)

---

## 13. Suggested build sequence
1. Apply for Family Controls entitlement (blocking dependency — do first).
2. Technical spike: shield → deep-link → unlock round-trip on a real device.
3. Core journaling + local storage + streak.
4. Wire blocking config + scheduling to the journaling unlock.
5. Onboarding + polish + metrics.
