# Onboarding Hook — Animated Ad: Production Guide & Director's Prompt

> The signature first-launch animation for Journal Blocker. Black & grey, surreal, cinematic. A character's brain decays as they doom-scroll and shrink inside a growing room; they wake, open the app, journal — and the brain regrows as their life expands.

---

## Part 1 — How to build it with AI (the realistic workflow)

**Reality check:** no single AI tool will one-shot a coherent, character-consistent, multi-beat narrative with precise morphs (decaying→regrowing brain, person-shrinks/room-grows). You build it **shot by shot** and **edit the shots together**. That's how AI ads are actually made right now.

### Recommended pipeline
1. **Lock the look + character (stills first).**
   - Generate black-&-grey **style frames** and a consistent **character reference** in *Midjourney v7* or *Flux* (or Sora's image mode). Reuse that reference image in every shot so "you" looks like the same person throughout.
2. **Generate each shot as image-to-video with start/end keyframes.**
   - The morphs (brain decay/regrow, room scaling) work best with **first-frame + last-frame** keyframing. Best tools for that today:
     - **Kling 2.x** (Kuaishou) — excellent motion + start/end frame control; great for morphs.
     - **Luma Dream Machine (Ray2)** — strong keyframe "morph between two images."
     - **Runway Gen-4** — best *director* controls (motion brush, camera moves); great for ads.
     - **Pika 2.x** — "Pikaframes"/effects, fun for surreal transitions.
     - **Google Veo 3** — most cinematic + native sound, if you want generated audio per shot.
     - **OpenAI Sora 2** — best at surreal narrative beats; can attempt mini-sequences.
3. **(Optional) Fast rough cut** — let *Sora 2* or *Veo 3* attempt a storyboarded sequence from the master prompt to preview pacing before you refine shot-by-shot.
4. **Composite the hard metaphor in After Effects.** The "person shrinks / room grows" forced-perspective beat and the end logo card are cleaner and more controllable done as **motion graphics in After Effects** than via pure prompting. AE also does the brain morph nicely with displacement.
5. **Edit, grade, sound.** Assemble in *Premiere* or *CapCut* → push to true monochrome + film grain → add sound design (low drone in decay, a clean "breath/chime" at the turn). Keep music silent-switch-friendly.

### If you'd rather hire it out
- **Freelancers:** search Upwork/Fiverr for "**AI video ad**," "**AI commercial**," "**Runway / Sora / Kling animator**," or "**AI motion designer**." Share *this document* as the brief.
- **AI-native creative studios** (boutiques specializing in generative ad spots) if budget allows.
- **Ballpark:** DIY = a few tool subscriptions (~$30–100/mo each, expect many regenerations). Freelancer = ~$200–2,000+ depending on polish.

### Practical tips
- Expect to generate each shot **many times** and cherry-pick — that's normal.
- Keep prompts **monochrome-explicit** ("black and white, desaturated, grayscale") so no color sneaks in. The lone exception: a faint warm glow from the phone/orb at the turn (optional — or stay pure B&W and use *light/contrast* as the emotional shift).
- 9:16 vertical for the in-app hook; export a 1:1 / 16:9 too for paid social ads.
- Hook length **~6–12s**; this ad/brief is written at ~30s so you can trim down to the hook and keep the longer cut for marketing.

---

## Part 2 — The Director's Prompt

### Master brief (paste at the top of any tool)
> **Style:** Cinematic black-and-white / greyscale short film. High-contrast, moody, fine 16mm film grain, soft volumetric light, shallow depth of field. Surreal, metaphorical, dreamlike. No text except the final card.
> **Palette:** Pure blacks, charcoal greys, soft whites. Desaturated, grayscale only. (Optional single accent: a faint warm white-gold glow from the phone screen at the turning point.)
> **Tone:** Melancholy → awakening → hopeful. Slow, deliberate pacing that quickens as life returns.
> **Character:** A single young adult, plain clothes, expressive, consistent across every shot (use the same reference image).
> **Camera:** Slow push-ins and pull-outs, gentle parallax, one or two match-cuts/morphs. Tripod-stable in decay, freer and floating as growth begins.
> **Recurring motifs:** (1) a human brain that decays and later regrows; (2) the character shrinking as the room grows; (3) the phone — first a grey trap, then the glowing source of change.

### Shot list (image-to-video; each ~2–4s)

**1 — The living brain.** A detailed human brain suspended in black void, dimly lit, faintly pulsing, alive. Slow push-in. *Grayscale, volumetric light, film grain.*

**2 — Decay (time-lapse).** The brain withers, cracks, greys over and crumbles; tendrils retract, dust drifts off. Motion-picture decay, accelerating. *Macro, slow rot, ominous.* → end frame = a shriveled, dim husk.

**3 — Morph to the room.** Match-cut: the shriveled brain dissolves into a hunched young person sitting on the edge of a bed in a sparse grey bedroom, face lit cold by a phone screen, the only light. *Start frame = brain husk; end frame = figure on bed.*

**4 — Days passing.** Time-lapse: light sweeps day→night→day through the window, shadows race across the walls, but the figure stays frozen, hunched over the phone. *Stillness amid passing time, oppressive.*

**5 — The shrink (the key metaphor).** Forced perspective: the figure shrinks smaller and smaller while the bedroom — walls, furniture, ceiling — swells enormous around them, until they're a tiny speck swallowed by a vast grey room, lit only by the phone's glow. Slow, dreamlike, unsettling. *(Best built/refined in After Effects.)*

**6 — Rock bottom.** Hold: the tiny figure, alone in the cavernous grey space, phone glow the only light. Silence. A breath.

**7 — The wake.** The figure lifts their head and opens their eyes — a flicker of awareness. Subtle. The first real human moment.

**8 — The turn (journaling).** They raise the phone, but this time open the app — a soft orb glows on screen. They begin to speak into it (journaling). A gentle warm-white light spreads from the phone across their face. *First light. Optional faint warm accent here.*

**9 — Reverse expansion.** As they journal, the room shrinks back to normal scale / the figure grows back to full size; the greys lift toward brighter, cleaner light; shadows recede.

**10 — Brain regrows.** Cut back to the brain in the void — now regenerating: tissue rebuilds, neural tendrils branch out and bloom, faint light glows within. The exact reverse of shot 2. *Hopeful, alive.*

**11 — Life expands (montage).** Quick warm beats of the now-upright character moving with purpose — opening curtains to light, walking outside, a small genuine smile, real connection. The world is bright and clear. *Camera freer, floating.*

**12 — End card.** Fade to clean white/soft grey. The orb mark animates in, then the app name and tagline. *Minimal, calm.*

### Transition notes
- Shots **2↔10** are mirror images (decay vs regrowth) — generate them as a matched pair.
- Shots **3** (brain→figure) and **5** (scale shift) are the two hardest; budget the most iterations / AE work there.
- The single emotional pivot is **shot 8** — the only place light/optional color enters. Protect it.

### Condensed one-shot prompt (for Sora 2 / Veo 3 rough cut)
> Cinematic black-and-white surreal short, fine film grain, high contrast. A glowing human brain decays and crumbles to a husk; it morphs into a hunched young person trapped on a bed staring at a phone in a grey room as days time-lapse past. The person shrinks tiny while the room grows enormous around them, swallowed in darkness lit only by the phone. They wake, open a journaling app with a glowing orb, and begin to speak — warm light spreads, the room returns to scale, and the brain regrows with branching glowing neurons. The person rises, steps into bright light, transformed. Slow melancholic pacing turning hopeful. Grayscale only.
