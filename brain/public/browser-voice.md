# Browser voice

`browser-voice.js` exposes `LeeWayBrowserVoice` without a server, paid inference API, API key, or localhost dependency. Load it as a normal script. It finds `chatterbox.worker.js` relative to its own script URL, including on GitHub Pages repository paths.

```js
const voice = new LeeWayBrowserVoice();
// Call from an explicit user action. First use downloads a large model.
await voice.load(progress => updateDownloadDisplay(progress));
await voice.speak('Here is the project summary.', {
  signal: turnAbortController.signal,
  onState: updateVoiceStatus
});
voice.stop(); // Immediate local playout suppression, cancels pending speech.
await voice.setReference(file); // Optional owned/licensed 1–30 second clip.
await voice.dispose(); // Releases worker and audio resources.
```

`ready`, `device`, and static `download` provide UI state. `load` emits Transformers.js progress records (`status`, `file`, `loaded`, `total`, `progress` when available), then `{status:'ready', device}`. Browser cache persistence depends on storage availability and browser eviction. Do not claim the model is permanently installed.

Pinned dependencies verified September 28, 2026:

- Transformers.js **4.3.0**, from its versioned jsDelivr distribution.
- `onnx-community/chatterbox-ONNX` revision **3cab09af388d3f02bba43443fce88c1f4525ac43**; model card declares MIT.
- GPU q4f16 weight files total **1,499,401,538 bytes**; q4 CPU files total **1,548,283,901 bytes**, plus runtime/tokenizer/configuration assets and the **720,078 byte** Agent Lee reference WAV. A GPU without shader-f16 uses q4.
- CPU mode uses single-thread WASM, so cross-origin isolation headers are not required. GPU mode requires a working WebGPU adapter. Large memory usage and inference time depend on the visitor's device; mobile viability needs measurement.

The default reference is a 15-second excerpt of `Agent_Voice_One.m4a`, explicitly chosen by the user from the LeeWay ecosystem. It is bundled in `voices/agent-lee-reference.wav` with a provenance JSON record. The previously located active generated voice sample was rejected by the user and is not used. An owned or licensed voice clip can provide a different reference: decoding, resampling and speaker encoding remain in the browser, with no upload. Requested accent, depth and naturalness need an actual audition. The client does not claim a specific person or an authenticated human voice.

Inference runs serially in a worker. Speech is split into bounded chunks; interruption cancels token generation when supported and always suppresses stale output at the client. A model decoder may finish some computation after Stop, but its audio is discarded. Worker termination in `dispose` releases ongoing computation. Five cancellation/lifecycle tests are in `browser-voice.test.cjs`; passing them is not proof of acoustic quality or live-microphone interruption performance.

Sources: [Resemble AI browser demo](https://github.com/resemble-ai/transformersjs-chatterbox-demo), [pinned model](https://huggingface.co/onnx-community/chatterbox-ONNX/tree/3cab09af388d3f02bba43443fce88c1f4525ac43), [Transformers.js](https://github.com/huggingface/transformers.js).

Browser verification: the original model reference loaded, generated a greeting, reached playback, and completed. The user confirmed hearing it. First generation took several minutes; this does not establish live conversational responsiveness. The user-selected Voice One reference also initialized, generated a greeting, reached playback and completed; preparation took about two minutes on the test browser’s Intel Xe-LPG GPU. Acoustic similarity remains a user audition judgment.

After audition, the user confirmed Voice One was clear and requested less excited delivery. Default Chatterbox exaggeration was reduced from 0.5 to 0.25. The UI offers Calm, Natural, and Lively delivery while preserving the selected reference, pitch and playback rate.

The user then requested a slightly faster speaking pace. Default playback is now 1.1× through HTML audio with `preservesPitch=true`. PCM samples are encoded as a WAV locally. Stop pauses and releases media/blob resources. Speaking pace can change during playback without regenerating speech. A sixth voice test verifies pace changes, pitch preservation configuration and immediate Stop cleanup.
