# LeeWay Digital Brain — Thread Voice Pilot Qualification

**REGION:** LEEWAY_DIGITAL_BRAIN  
**TAG:** LEEWAY_THREAD_VOICE_PILOT_V1  
**STATUS:** CANDIDATE — SOURCE/CI VERIFIED; LIVE ACOUSTIC QUALIFICATION PENDING  
**DATE:** 2026-09-28  
**CREATOR AUTHORITY:** Leonard Lee / LeeWay Standards  
**IMPLEMENTATION TARGET:** 4citeB4U/RapidWebDev  
**FORMULA:** Governance funnel applied; canonical numeric Formula evaluation NOT EXECUTED for this pilot.

## 5WH identity

- **Who:** Parent Agent Lee control plane, LeeWay Parallel Workplane, browser Gemma provider, Chatterbox Voice One renderer, Creator.
- **What:** Main/side conversation identity, eight governed work slots, serialized shared-Gemma inference, one-mouth speech lease, pause/resume, source-announced thread transitions.
- **When:** Pilot created and qualified on 2026-09-28.
- **Where:** LeeWay Digital Brain browser runtime / GitHub Pages publication.
- **Why:** Preserve main work during side questions, prevent simultaneous speech, retain provenance, and reduce discarded inference/speech work.

## Authority and existing owners

This pilot does not create another Agent Lee, Runtime Fabric, Formula implementation, or persistent worker registry. It extends the existing browser Digital Brain and follows the published leeway-parallel-workplane, leeway-real-time-voice-multimodal-infrastructure, Conversation Vault, and Learning Ledger boundaries.

## Proven source behavior

1. One main thread plus explicit side threads with stable LW-THREAD-* identities.
2. Eight governed hand slots (HAND-01 through HAND-08).
3. Shared resource locking: the browser Gemma instance is serialized because its provider permits only one active operation.
4. Independent resources may occupy separate hands concurrently.
5. A single speech lease; Chatterbox never intentionally receives two audible thread owners at once.
6. Deterministic spoken source transitions for main/side changes.
7. Reversible pause/resume of current browser playout without advancing the voice epoch.
8. Acoustic onset pauses presentation first; only a finalized transcript routes a side question.
9. Explicit work cancellation remains separate from conversation/voice cancellation.
10. Thread IDs are included in local runtime metrics and visible conversation labels.

## Current CI evidence

Pilot branch: agent-lee-thread-voice-pilot-20260928

Acceptance gate at commit 9782bc45c1cd88058e74affc12f877da028abd9a:

- JavaScript syntax checks: PASS
- Browser/unit/integration tests: 63 PASS / 0 FAIL
- Workplane default eight-hand test: PASS
- Shared Gemma serialization test: PASS
- Different-resource concurrency test: PASS
- One-mouth pause/side/resume arbitration test: PASS
- Pause/resume preserves voice epoch test: PASS
- Live-page script-order and thread-control integration assertions: PASS
- Speech-onset no longer owns Gemma cancellation: PASS

CI PASS is source/runtime-simulation evidence. It does not prove microphone acoustics, human hearing, WebGPU performance, model download success, or Voice One quality on a physical device.

## Formula Funnel boundary

Applied path:

Continuity → Context → Formula governance → Capability → Browser runtime → test evidence → Veritas candidate review

The canonical Formula evaluator expects authorized measured state, including the 16×6 historical input family. This pilot does not fabricate voice measurements or Q69 values.

FORMULA_NUMERIC_EVALUATION = NOT_EXECUTED

Candidate future measurement row:

1. text-to-audible onset latency,
2. interruption spill,
3. resume latency,
4. dropped committed words,
5. duplicated spoken words,
6. wasted synthesis duration.

Ranges/mappings remain unpromoted until authorized and empirically qualified.

## Required live acceptance before promotion to LeeWay agent standard

- GitHub Pages serves the exact pilot scripts and thread controls.
- Browser startup has no blocking console/runtime errors.
- Gemma 4 loads on a supported WebGPU device.
- Chatterbox Voice One loads and preserves selected voice quality.
- Main answer can stream while a side question is captured.
- Side question pauses the main mouth without cancelling main work.
- Side reply announces its source and is spoken alone.
- Main reply resumes with source announcement and no duplicate/dropped committed text.
- Pause and resume preserve the same audio/task state.
- Explicit Stop cancels speech without silently cancelling unrelated work.
- Explicit work cancellation cancels the intended work only.
- Repeated interruptions do not leak stale text/audio across thread IDs.
- At least 20 real conversational interruption trials are captured for latency/error qualification.
- Conversation Vault/receipt integration is proven before claiming persistent cross-session learning.

## Promotion law

This pilot becomes a reusable LeeWay agent standard only after the live/acoustic acceptance gate passes and a versioned standard is promoted through Veritas/Receipt/Learning Ledger. Until then it remains a candidate implementation, not constitutional authority.