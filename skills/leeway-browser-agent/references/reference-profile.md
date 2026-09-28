# Agent Lee reference profile

Repository: https://github.com/4citeB4U/RapidWebDev
Website: https://rapidwebdevelop.com

Approved choices: GitHub Pages; browser-only free inference; free external model downloads; Gemma 4; Chatterbox; selected Agent_Voice_One.m4a; Calm/exaggeration 0.25; pace 1.1 with pitch preservation. These are Agent Lee defaults, not a requirement that all agents sound identical.

Reference WAV SHA-256: `638c88b332ecc7a21950511871c724f68f3eb566c59157e46493ee79ec55970e`. Preserve authorization and provenance when replacing voices; do not silently use rejected generated references.

Modules: gemma-browser.js, gemma-browser-worker.js, browser-voice.js, chatterbox.worker.js, browser-listener.js, voice-controller.js, speech-pipeline.js, and welcome-player.js. Recheck current names/code. Unit tests cover lifecycle, not acoustics.

September 2026 findings: Turbo trials on the observed Intel graphics path took approximately 52 and 349 seconds for a two-clause prompt. Turbo did not expose the same exaggeration control and was not promoted. Base Chatterbox prepared-audio generation also needed transcript inspection after later phrases were missing from an initial result. Failed audio is not an acceptable onboarding asset.

Last observed source commits: Skills `f5ac2dcd787f00a4e66fe8128b968b98031045a7`; Formula `febaad02c156180c38e90b2b659df003d5d196f9`. Reverify before reuse. Formula requires centralized evaluation with implementation/adapter identity and authorized inputs. Public source knowledge can work on Pages; task evaluation remained NOT_EXECUTED without a verified runtime.
