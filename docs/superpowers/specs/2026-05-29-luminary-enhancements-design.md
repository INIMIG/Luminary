# Luminary Enhancement Design — Hackathon Software Sprint

**Date:** 2026-05-29
**Branch:** `feature/luminary-enhancements` (to be created)
**Author:** INIMIG (with Claude)
**Scope:** Software-only enhancements to the existing demo. Hardware/camera input is out of scope (handled separately by collaborator 530kathy).

---

## 1. Goals

Three asks from collaborator, ordered by judging-day impact:

1. **Multi-character voice narration** — replace single-narrator robotic/flat playback with a small dramatic cast (Narrator + Prey + Predator) using high-quality OpenAI TTS.
2. **Free-text interaction** — keep the existing 3-option quiz, add a new free-text panel below it for (a) asking the tutor anything about the current chapter, and (b) submitting a free-form answer to a deeper open prompt. Text typing **and** voice input via Whisper.
3. **Better 3D models + cinematic polish** — replace procedural fish/shrimp/dragonfish with the GLB assets already in the repo, and add bloom + underwater fog/depth-of-field for a Hollywood color-grade feel.

**Success criteria for demo day:**
- Default deep-sea demo plays end-to-end with three distinct voices in video mode
- A judge can type or speak a question into the new panel and get a coherent GPT-4o answer in <5 seconds
- The default scene visibly looks more cinematic (clear bloom on bioluminescence, depth fog, GLB models replacing primitive shapes)
- All existing functionality (quiz, controls, generated content mode) still works

---

## 2. Architecture Overview

```
                ┌────────────────────┐
   .env ──────► │  run_demo.py       │ ← Python HTTP server (existing)
                │                    │
                │  /api/tts          │   POST text → OpenAI TTS → mp3
                │  /api/tts-config   │   GET TTS availability
                │  /api/chat       ★ │   POST messages → GPT-4o → text   (NEW)
                │  /api/transcribe ★ │   POST audio   → Whisper → text   (NEW)
                └────────────────────┘
                          ▲
                          │ fetch
                          │
                ┌────────────────────┐
                │  app.js (browser)  │
                │                    │
                │  voice/ ★          │   pickVoiceForLine(speaker)        (NEW)
                │  chat/  ★          │   askTutor() / gradeAnswer()       (NEW)
                │  mic/   ★          │   recordAudio() → /api/transcribe  (NEW)
                │  scene/ ★          │   loadGLB() + bloom/fog passes     (NEW)
                └────────────────────┘
```

★ = new code in this sprint.

**No build step added.** Stays single ES module (`app.js`) + raw HTML. Build tools were rejected because they'd interfere with the no-friction `python run_demo.py` workflow.

---

## 3. Feature 1 — Multi-Character Voice (Level B)

### Cast (locked)

| Role | OpenAI Voice | Used For |
|------|--------------|----------|
| Narrator | `alloy` | Scene framing, transitions, scientific exposition |
| Prey | `nova` | Voicing shrimp/lanternfish (soft, vulnerable) |
| Predator | `onyx` | Voicing dragonfish/hunters (deep, ominous) |

### Data model change

Current `DEFAULT_VIDEO_SEGMENTS` entries have one `narration` string. Replace with an array of `lines`:

**Before:**
```js
{ stage: "hunter", durationMs: 7000, ..., narration: "第四節，把視角切到獵物。對多數深海生物來說..." }
```

**After:**
```js
{
  stage: "hunter",
  durationMs: 9000,                       // recomputed to fit dialogue
  hunterLight: true,
  visionMode: "prey",
  lines: [
    { speaker: "narrator", text: "第四節：紅光刺客登場。" },
    { speaker: "prey",     text: "周圍一片漆黑…我藏得很完美。" },
    { speaker: "predator", text: "你以為紅色就能隱形嗎？我有別人沒有的眼睛。" },
  ],
}
```

Backwards compat: if a segment still has `narration` (no `lines`), treat it as `[{ speaker: "narrator", text: narration }]`. This means the generated-content mode continues to work without rewriting its narration generator.

### Playback

- New function `playSegmentLines(segment)` plays each line sequentially: fetch TTS for the line's text using the speaker's voice → play `<audio>` → on `ended`, advance to next line.
- Captions update per-line, prefixed with the speaker label (e.g., `🦐 紅蝦：周圍一片漆黑…`).
- Caption emoji-prefixes: `🎙️` narrator, `🦐` prey, `🦈` predator.
- Segment progress bar advances proportionally to total line audio durations.
- Cache key changes from `${index}:${stage}:${narration}` to `${index}:${stage}:${speaker}:${text}` so each speaker variant is cached separately.

### TTS model upgrade

`OPENAI_TTS_MODEL` in `.env` already set to `tts-1-hd`. Backend `run_demo.py` already passes the model through. **No code change needed**, only verify it's used.

### Dialogue rewrites

Hand-write 8 segments worth of dialogue. Estimated 30-50 short lines total. Stays in Traditional Chinese to match existing tone. Drafts will live as a separate JSON file (`assets/dialogue.zh-Hant.json`) so non-coders can edit without touching `app.js`.

---

## 4. Feature 2 — Free-Text Interaction Panel

### UX

A new section appears below the existing quiz section, titled **「追問與練習」** (Ask & Practice).

```
[ Mode toggle: 追問 (Ask) | 答題 (Answer) ]

[ multiline textarea — placeholder changes by mode ]   [🎤]

[ Submit button: 詢問 / 提交答案 ]

[ response area — streamed text appears here ]
```

### Two modes

**Ask mode** (default):
- Placeholder: *"對這一節有任何疑問都可以問。例如：為什麼紅色在深海會變黑？"*
- Submit → POST to `/api/chat` with chapter context + user question → render reply.

**Answer mode**:
- Placeholder: *"請用自己的話解釋為什麼紅蝦在 800 米看起來像黑色。"*
- Each chapter gets one open-ended prompt added to its data structure.
- Submit → POST to `/api/chat` with chapter context + open-prompt + user answer + "grade this" instructions → returns `{ verdict: "correct"|"partial"|"wrong", feedback: "..." }`.
- Verdict renders as a colored badge (✓ green, ◐ amber, ✗ red) followed by feedback paragraph.

### Voice input (Whisper)

- 🎤 button uses `MediaRecorder` API to capture mic audio → uploads `audio/webm` to `/api/transcribe` → fills the textarea with transcribed text.
- While recording: button pulses red, stop = click again or auto-stop after 30s.
- Whisper supports Chinese natively (`whisper-1` is multilingual).

### Backend endpoints (new in `run_demo.py`)

#### `POST /api/chat`

Request:
```json
{
  "messages": [
    { "role": "system", "content": "...chapter context..." },
    { "role": "user",   "content": "..." }
  ],
  "mode": "ask" | "grade"
}
```

Response:
```json
{ "reply": "...", "verdict": "correct" | "partial" | "wrong" | null }
```

Calls `https://{OPENAI_BASE_URL}/chat/completions` with `model = OPENAI_CHAT_MODEL` (default `gpt-4o`). For `grade` mode, system prompt instructs structured `<verdict>` tag in output that the server parses.

#### `POST /api/transcribe`

Request: `multipart/form-data` with `audio` file.
Response: `{ "text": "..." }`

Calls `https://{OPENAI_BASE_URL}/audio/transcriptions` with `model = OPENAI_WHISPER_MODEL` (default `whisper-1`).

### Context for the AI

Per-chapter system prompt is built from the existing stage data:
- `stage.title`, `stage.lead`, `stage.body`, `stage.facts` — already exist
- Plus the source article excerpt for that chapter (slice of `demo.md`)

Stays under 2k tokens per request. With unlimited tokens, no caching strictness needed; we still cache by exact `(chapter_id, mode, user_text)` to avoid duplicate API calls during demos.

### `.env` additions

```env
OPENAI_CHAT_MODEL=gpt-4o
OPENAI_WHISPER_MODEL=whisper-1
```

---

## 5. Feature 3 — 3D Models + Cinematic Polish

### Model swap

Current default scene uses procedural meshes built in functions like `createLanternFish`, `createShrimp`, `createDragonfish`. Replace each with a GLB asset already in `assets/models/`:

| Procedural | Replace with GLB |
|-----------|------------------|
| `createLanternFish` (counter-illumination chapter) | `counter-fish.glb` |
| `createShrimp` (red paradox chapter) | `crawfish.glb` |
| `createDragonfish` (hunter chapter) | `predator-shark.glb` (or `glub-evolved.glb` if it looks more dragonfish-ish) |

Procedural functions stay as **fallback** in case a GLB fails to load — non-blocking degradation.

Critical preserved features after swap:
- Photophore glow points (counter-fish belly) — overlay child Three.js point-lights on the GLB at hand-picked anchor positions. Document the anchor offsets in code comments.
- Red probe/scan light interaction — keep as separate scene objects, not part of the model.
- Hunter vision mode shaders (omniscient/prey/hunter) — keep applied at scene level via material overrides.

### Cinematic post-processing

Add Three.js `EffectComposer` pipeline:

1. `RenderPass` (base)
2. `UnrealBloomPass` — strength `0.7`, radius `0.6`, threshold `0.85`
   - Makes bioluminescence glow believably
3. `BokehPass` (depth of field) — focus on stage subject, blur far-off particles
   - Adds underwater hazy depth
4. Existing `scene.fog` already provides volumetric feel — tune to denser falloff

Imports added:
```js
import { EffectComposer } from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }     from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass }      from "https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/BokehPass.js";
```

Animation loop changes from `renderer.render(scene, camera)` to `composer.render()`.

Toggle: a setting in `state.scene.cinematic` (default `true`) so we can disable bloom on weak hardware. Hidden behind a developer key combo (Shift+B), not user-exposed for hackathon.

### Performance budget

- Target: 60fps on a typical laptop with integrated GPU
- Bloom + DoF are the heavy passes; if we drop below 40fps in testing, reduce `UnrealBloomPass` resolution to half, or disable BokehPass
- Pixel ratio capped at 2 (already in code)

---

## 6. Failure & Fallback Behavior

| Failure | Behavior |
|---------|----------|
| TTS API down / 401 | Fall back to browser `speechSynthesis` (existing behavior) — using the *same* voice for all speakers (single-voice mode) since browser TTS doesn't have OpenAI's voice variety. Caption still shows speaker label. |
| Chat API down / 401 | Free-text panel disables itself with banner: *"AI 對話暫時無法使用，請晚點再試"* |
| Whisper API down | Mic button disabled with tooltip; user can still type |
| GLB load fails | Procedural mesh fallback (existing functions retained, not deleted) |
| Bloom/DoF crashes WebGL | Catch error in init → fall back to direct `renderer.render()` |
| User offline | All features degrade gracefully; default demo (no AI) still plays with browser TTS |

---

## 7. File Changes Summary

| File | Change |
|------|--------|
| `.env` | Add `OPENAI_CHAT_MODEL`, `OPENAI_WHISPER_MODEL` (✓ done: API key + base URL already set) |
| `.env.example` | Add the two new env vars (without values) |
| `.gitignore` | ✓ done (already added) |
| `run_demo.py` | Add `/api/chat` + `/api/transcribe` endpoints |
| `app.js` | Multi-line playback, free-text panel logic, GLB swap, post-processing pipeline |
| `index.html` | Add free-text panel section (HTML markup + minimal CSS) |
| `assets/dialogue.zh-Hant.json` | NEW — multi-character dialogue lines |
| `docs/superpowers/specs/2026-05-29-luminary-enhancements-design.md` | This file |

---

## 8. Out of Scope

- Hardware / webcam input (collaborator owns this)
- English translation
- Mobile-specific UX rework
- Refactoring `app.js` into modules (separate concern, deferred)
- DALL-E texture generation / GPT-4 asset picking (rejected; would not improve a sparse 8-asset library and risks demo reliability)
- Quiz scoring across all chapters (nice-to-have, deferred)
- PWA / offline support

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Corporate TLS intercepts proxy calls (we hit this with curl) | Run from browser (different cert path); have backup browser-TTS demo path; test on demo network early |
| GLB models don't visually fit chapters | Procedural meshes stay as fallback; can revert per-chapter if needed |
| Bloom kills framerate on demo laptop | Disable via dev hotkey before judging |
| GPT-4o gives wrong/hallucinated chapter info | System prompt anchors strongly to provided context; in grade mode, ground truth is explicitly given |
| Recorded audio doesn't transcribe well in noisy demo venue | User can fall back to typing |

---

## 10. Definition of Done

- [ ] All three features merged to `main` (after PR review with collaborator)
- [ ] Default demo plays full video mode with 3 distinct voices
- [ ] Ask + Answer + voice input all work for at least chapter 3 (red paradox) end-to-end
- [ ] Default scene shows GLB models with visible bloom on bioluminescence
- [ ] No regressions in existing controls (depth slider, vision modes, generated content)
- [ ] README.md updated with run instructions including new env vars
