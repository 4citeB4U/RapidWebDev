# Browser voice qualification

The main page retains Gemma 4, the user-selected Voice One reference, Chatterbox Calm 0.25 and pitch-preserved playback at 1.1x.

The speech pipeline submits complete clauses during Gemma generation, with an 18-word/180-character fallback and a 1.2-second dwell after ten complete words. Text backlog is bounded at 12,000 characters. A single following speech segment can be synthesized during playback. Stop invalidates the stream and pending audio; conversation history includes completed spoken segments, not unplayed generated text. This is conservative: a partially played segment is omitted rather than represented as fully heard.

Free browser AI > Voice timing exposes local-only software timestamps and an export. The bounded report contains no prompts, transcripts or microphone recordings. `playback-start` is a browser media event; `local-stop` is a software cancellation span. Neither proves human hearing or acoustic spill time. Worker phase timings bracket speech-token generation and waveform decoding. Model load states and transcription timing are recorded separately.

`voice-lab.html` provides explicit model downloads, a repeatable three-trial speech comparison and a microphone interruption check using the selected recording. Turbo is pinned separately and remains experimental. Its delivery controls must not be assumed equivalent to the base model. It does not change the main page's provider.

Use headphones first. Say “stop” while the recording plays, confirm that it becomes silent, then check the transcript. End the test to release the microphone. Repeat with a natural interjection, noise, consecutive interruptions and the actual main-page conversation. Speaker echo needs its own qualification.

Proposed targets are warm first meaningful speech within 3 seconds and acoustic interruption spill below 250ms at p95. These are targets, not measured claims. Three lab trials are preliminary evidence, not a 20-turn latency qualification. Shared-GPU contention, cache state, device thermals and the animated page can change results.

LeeWay Formula Funnel is applied as evidence governance. No canonical mapping of these voice measurements to the raw 16x6 Formula input has been verified. No numeric Formula evaluation or native Veritas receipt is claimed by these changes.
