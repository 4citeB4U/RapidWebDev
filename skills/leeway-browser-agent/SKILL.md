---
name: leeway-browser-agent
description: Build and qualify LeeWay agents on GitHub Pages with browser-local reasoning, selectable natural voices, microphone interruption, and canonical Skills and Formula evidence.
---

# LeeWay Browser Agent

Use this reusable browser foundation alongside the canonical LeeWay real-time voice skill. Reference implementation: `4citeB4U/RapidWebDev`, `brain/public/`. Inspect current source and deployment before edits. Read [the reference profile](references/reference-profile.md) when adapting it.

## Authority and capabilities

Verify `4citeB4U/LeeWay-Agent-Skills`; read AGENTS.md, bootstrap, continuity, message-ingress, and applicable voice/design skills. Record repository/ref identity. Reuse a current verified session; refresh stale evidence. Source access is not runtime connection.

Verify `4citeB4U/Leeway-formula-live` and its consumer contract. Use its authorized centralized evaluator; do not invent a browser Formula engine or map arbitrary UX measurements into canonical inputs. Without a verified evaluator and authorized input mapping, report `NOT_EXECUTED`. Pinned references can still inform ordinary reasoning.

Expose explicit browser capabilities: navigation, drafting, and user-triggered downloads can run on Pages. Shell work, deployments, private repository writes, and host tools require separately authorized adapters. Never ship credentials, automatically execute generated code, or imply that reading a skill grants tools. Show source provenance separately from execution state.

## Browser foundation

- Keep the app static on GitHub Pages; free public model downloads are permitted. No mandatory paid API or local server for visitors.
- Preserve the requested reasoning model and verify browser compatibility. Report unsupported hardware or unavailable files instead of substituting silently.
- Separate identity, reasoning, recognition, voice provider, voice reference, delivery, and playback pace. Agents may have different authorized voices.
- Use a prepared, content-verified introduction for immediate onboarding. Play it from the first conversation gesture without awaiting microphone permission or optional model downloads; a second toggle must cancel it. Name the agent, explain the platform and actual controls, and lead into conversation. Do not present it as a newly generated answer.
- Default public/mobile visits to an immediate, clearly labeled recorded guide in the approved voice. Do not require multi-gigabyte downloads to meet the agent or explore. Full local AI is an explicit optional download. Check estimated browser storage and model compatibility first, preserve the guide on failure, and never substitute a large in-memory download when storage is insufficient. Preserve cached complete files; do not promise resumable partial downloads without implementing and testing them.
- Once opted in, share preparation promises with Start conversation, show progress and retry controls, and reuse completed caches. Preparation must not wait for audio activation or request microphone access. Conversation cancellation must not accidentally terminate model preparation; explicit Unload must remain available.
- The first conversation click requests microphone permission immediately, independently of Gemma and Chatterbox. Start capture before local recognition finishes; show recognition preparation separately and bound pending audio. Microphone on is not proof that transcription or generated replies are ready. Stop and End cancel pending conversation startup and stale results. Failed initialization must permit a clean retry.
- Use the agent portrait as a true session toggle: first click requests continuous conversation, second click mutes microphone and spoken replies. Stop silences the current reply but leaves an active microphone listening. Reject microphone startup after a pending request is muted. Keep explicit model-download consent when models are absent; never gate microphone capture on full-model preparation.
- Use distinct transient speaker bubbles, optional typing, and a collapsed, bounded chat history. Label recorded guidance and interrupted drafts; text history is not proof of heard audio. Avoid raising the phone keyboard from the microphone button.
- Keep text answers usable when audio is slow or fails; distinguish waiting, speaking, and listening.

## Conversation invariants

Use an interrupt epoch across microphone onset, STT, LLM, TTS, queued audio, and introductions. Suppress local audio first and reject late results. Bound queues and prefetch. Group meaningful phrases without dropping words. Preserve observable completed playout in spoken history; distinguish rendered audio from human hearing.

Measure loading, transcription, first token, synthesis, audio duration, playback gaps, and interruption spill. Streaming does not prove real-time speech. Generating one second of audio in many seconds cannot sustain conversation merely by changing chunk size.

## Qualification and graduation

Check generated content, not just file existence or playback events. Compare transcription with intended text and obtain listening feedback for voice quality. Test consecutive generations; first-phrase success is insufficient. Preserve selected voice and pitch when changing speed.

Test cancellation races, timeout/retry, stale transcripts, and queue limits. Inspect desktop/mobile UI and production delivery. Use the actual conversation screen for acoustic tests; label diagnostic pages and stop competing test audio first.

Keep a profile CANDIDATE or SANDBOXED until device/model/voice end-to-end and physical microphone tests pass. Record revisions, measurements, failures, and remaining limits. Do not generalize one hardware result to all visitors or invent Formula/Veritas receipts.
