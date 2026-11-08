<!--
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.HANDOFF
TAG: LEEWAY.RAPIDWEBDEV.ENGINEERING_JOURNEY_CODEX_HANDOFF
5WH:
WHAT = Record ready-to-bind public portfolio voice, storytelling and Machine Consciousness boundary.
WHY = Preserve the Creator's current work while local Codex finishes the existing consciousness engine, not a replacement.
WHO = Creator/Human Authority, RapidWebDev maintainer, local Codex, Runtime Fabric and Machine Consciousness owners.
WHERE = brain/ENGINEERING-JOURNEY-CODEX-HANDOFF.md in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Exact source and feature map, public-question response contract, negative security rules, gates and rollback.
LICENSE = Existing repository terms unchanged; no new license asserted.
-->
# Agent Lee public engineering journey — implementation and Codex handoff

**Mission:** [RapidWebDev #9](https://github.com/4citeB4U/RapidWebDev/issues/9)
**Draft integration:** [RapidWebDev PR #10](https://github.com/4citeB4U/RapidWebDev/pull/10)
**Product:** https://rapidwebdevelop.com
**Status:** PORTFOLIO SOURCE CANDIDATE; NO PROD DEPLOYMENT, NO PUBLIC CONSCIOUSNESS BINDING, NO PHYSICAL ACOUSTIC QUALIFICATION.

## Work completed on this draft branch

- `index.html`: explicit Talk with Agent Lee opening action, distinct prerecorded intro, Engineering Journey button and Source links display.
- `brain/public/intro-story.js`: user-gesture entry event; old recorded welcome remains intact.
- `brain/public/public-brain.js`: source-first narrative routing and safe source display; explicit legacy model opt-in; source-bound `publicQuestion` consumer; background page mutes microphone; Voice Fabric speaks non-LLM story and navigation responses.
- `brain/public/engineering-journey.js`: eight bounded chapters explaining the Creator's purpose, iterative design, LeeWay Engineering Loop, Formula, consciousness, voice, device embodiment and what remains. Supported requests return document sources, not fake runtime proofs.
- `brain/public/voice-fabric-session.js`: uses the **existing** Voice Fabric JS SDK (not an embedded TTS) and the active public Agent Lee voice profile; shared preparation, explicit exact-voice acceptance, stop/invalidation and no silent fallback.
- `brain/public/experience.css`: responsive CTA and evidence references.
- Tests: `brain/public/engineering-journey.test.cjs`, `engineering-journey-interaction.test.cjs`, and preserved existing conversation/thread tests.
- Handoff JSON: `brain/contracts/public-portfolio-question.v1.json`.

## Creator-approved division of responsibility

**Portfolio contributor:** complete browser interaction, storytelling, source projection and Voice Fabric client tests, without live Machine Consciousness binding.

**Local Codex with the Machine Consciousness owner:** once its existing deterministic runtime is qualified, wire **only** the existing Runtime Fabric's governed, read-only public question capability into the already-declared consumer interface, with security tests and a real execution receipt. Do not create a second Agent Lee, Formula, Runtime, voice provider or Model Hub.

### Exact browser handoff

The consumer checks for `globalThis.LeeWayEcosystemFabric.publicQuestion` (currently absent). The authorized owning adapter may expose:

```javascript
async function publicQuestion(question, {signal, threadId}) {
  // Only an owner-verified public Runtime Fabric gateway can implement this.
  // No hardcoded local PC path, direct carrier, secrets, host commands or raw receipts.
}
```

Required successful response:

```json
{
  "authority": "LEEWAY_MACHINE_CONSCIOUSNESS",
  "policy": "READ_ONLY_PORTFOLIO",
  "text": "A source-grounded public response",
  "sources": ["https://github.com/4citeB4U/LeeWay-Engineering/blob/main/README.md"],
  "llm": { "used": false }
}
```

The browser bounds text at 5,000 characters and displays only vetted first-party GitHub source URLs. A provider's `llm.used=false` field is **provider-reported, not independent proof**. The runtime owner's real admission and Veritas/Receipt evidence must establish that claim.

**Leave absent** until the protected public gateway exists. The site works in deterministic documentary-story mode without it. Unknown requests report an honest unsupported result; optional Qwen/Gemma/Gemini are not used unless a visitor explicitly opts into an optional model experience.

### Voice ownership

Existing `LeeWay-Voice-Fabric/src/voice-sdk.js` and `profiles/agent-lee-active-voice.v1.json` own the speaker. At this read the active package was `kokoro-am_michael`, with `agent-lee-voice-one` an optional clone; a profile update must not silently substitute the package. Voice Fabric is the **speech-output authority**. Current public speech **input** uses RapidWebDev's preexisting `browser-listener.js` local speech-recognition adapter. Do not label that input path “Voice Fabric ASR” until the owning voice input contract actually binds it.

### Hands-free lifecycle

Opening CTA → real user gesture → microphone permission request → local capture and existing speech recognition → deterministic story / authorized public question → Voice Fabric selected speaker → spoken answer → listen for follow-up. Speech-onset, Stop and Mute invalidate current audio; unrelated work is not automatically canceled. Hiding the tab mutes for privacy; resuming requires a deliberate action.

A browser can deny capture, lose focus, refuse autoplay, or fail to load a model/voice provider; these are visible **failures**, not permission to claim completion. The original prepared introduction and typed documentary responses remain available.

## Required remaining physical/production qualification (NOT EXECUTED)

1. Bind the approved read-only `publicQuestion` service through existing Runtime Fabric identity/issuer/admission, not a local `/respond` exposure.
2. Verify real authenticated browser and server readback, forged origin, invalid credentials, injected prompts, privilege denial, rate limits and service timeouts.
3. Qualify microphone approval/denial, recording indicators, local ASR model preparation, 20 consecutive questions, Voice Fabric selected speaker preparation and actual playback on desktop Chrome and Android Chrome.
4. Measure interruption / echo / stale audio, live response transcript, page hide/mute and two concurrent visitors. Distinguish software metrics from audible p95.
5. Test no-LLM path with every optional LLM route disabled; require true provider and adapter evidence rather than client hints.
6. Preserve PRE/POST independent Veritas, real Receipt Authority custodian readback and Learning Ledger eligibility rules.
7. Preview the exact PR SHA, review diffs, perform a real rollback rehearsal, then request explicit production promotion approval. GitHub Actions test PASS alone does not qualify production.

## Commands and rollback

Repository CI includes `node --check brain/public/public-brain.js` and `node --test brain/public/*.test.cjs`. For local source testing: `node --check brain/public/voice-fabric-session.js` and `node --test brain/public/*.test.cjs`. The 3D site remains `index.html`; no alternate site/controller was created.

As long as PR #10 is draft, production rollback is simply **not merging it**. If later approved and deployed, roll back through the exact reviewed commit SHA and verify old public entry/voice behavior. Never treat an untested production rollback as completed.
