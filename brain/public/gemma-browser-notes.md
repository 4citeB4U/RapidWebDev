# Browser Gemma integration evidence

Verified 2026-09-27 against Google's LiteRT-LM JS README and published package source.

- Runtime: `@litert-lm/core@0.17.1`; WASM binary resolution is explicitly pinned to `0.17.1` using `self.Module.locateFile` before loading the classic-worker runtime.
- Supported model: `gemma-4-E2B-it-web.litertlm`, Hugging Face repository `litert-community/gemma-4-E2B-it-litert-lm`.
- Model revision: `b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1`.
- Exact download size: **2,008,432,640 bytes** (2.01 GB / 1.87 GiB). Device memory requirements exceed the file size.
- Anonymous HEAD request against the revision-pinned model returned HTTP 200 and matching Content-Length; repository API reports `gated: false`.
- Published LFS SHA256: `3a08e8d94e23b814ae5414469c370c503813949acb8ceaa17e4ebf8a35af35b5`. Client checks final length but does not hash the entire 2 GB file.
- `Engine.create` accepts Blob or ReadableStream; default GPU_ARTISAN executor supports streaming. `maxNumTokens:4096`, response limit `512`, bounded recent history.
- `sessionConfig.maxOutputTokens` was verified in pinned `0.17.1/dist/session_config.d.ts`, and its implementation calls `wasmSessionConfig.setMaxOutputTokens`. It is not an assumed option.
- Package loader selects JSPI/Asyncify and relaxed-SIMD variants. This path does not test or require threads/SharedArrayBuffer/cross-origin isolation. GitHub Pages can serve the integration without custom COOP/COEP headers; successful GPU inference still needs device testing.
- `@litertjs/wasm-utils@2.0.0` calls `importScripts` in workers. The integration therefore uses a **classic worker** with dynamic import for the ESM runtime, not a module worker.
- OPFS caches the revision-specific model when quota is available. Cache survives unload; browser storage eviction can remove it. Interrupted cache writes are not reused unless their size matches. Insufficient quota falls back to a network stream without persistent cache.
- Cancel during loading terminates the worker and releases its resources. Cancel during generation invokes Conversation.cancel. Unload terminates the worker and rejects pending requests. No inference server or API key is used; CDN/model download requests are necessary on first load.
- Generation cancellation is scoped to the request ID, suppresses queued tokens, and checks cancellation after asynchronous conversation creation. The operation remains busy until conversation deletion finishes. A Node VM test confirmed cancel-during-creation produces no generation, rejects with AbortError, and prevents another generation until cleanup completes.
- Failure to open a cache writer falls back to uncached streaming. A mid-write storage failure cancels the stream and removes the incomplete revision file; a quota error tells the user to free storage and retry rather than silently redownloading the model.

## Interface

Import `./gemma-browser.js` once as an ES module. It installs `window.LeeWayBrowserGemma`:

```js
await LeeWayBrowserGemma.load({
  onProgress: ({loaded,total,cached}) => {},
  onState: state => {},
  signal: abortController.signal
});
const text = await LeeWayBrowserGemma.generate(prompt, {
  system: 'Grounded system instructions',
  history: [{role:'user',content:'Previous question'}],
  onToken: token => {},
  signal: abortController.signal
});
LeeWayBrowserGemma.cancel();
LeeWayBrowserGemma.unload();
```

UI should explicitly explain the 2.01 GB download before the user loads it. Capability failure must remain an error, not silently switch to remote inference. Browser module state becomes ready only after Engine.create succeeds.

## Verification boundary

Both new JavaScript files passed `node --check`. Repository metadata, published types, loader implementation and anonymous model access were inspected. Browser verification on September 28 succeeded: full model download, cached subsequent load, actual streamed answer, completed response, Stop during generation with no late response, and model unload. Unsupported-GPU behavior and broad hardware compatibility remain unverified. The runtime is Google's early-preview text-only browser API; it does not provide speech recognition or speech synthesis.

Sources: https://github.com/google-ai-edge/LiteRT-LM/tree/main/js ; https://ai.google.dev/edge/litert-lm/js ; https://www.npmjs.com/package/@litert-lm/core ; https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
