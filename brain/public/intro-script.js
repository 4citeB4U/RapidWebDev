/* LeeWay public opening copy. Keep UI text and prepared Voice One generation on this same source. */
(function(root){
 const segments=[
  "I'm Agent Lee. Welcome to the LeeWay Digital Brain, the public working estate of Leonard Lee and the LeeWay ecosystem.",
  "Before you enter, one truth matters: this is not a claim that every project is finished. Some components are complete enough to demonstrate and are backed by working code, tests, or receipts. Many others are active builds, prototypes, research, or experiments. Their evidence state matters.",
  "The brain is organized this way because the work is connected. Ideas connect to standards. Standards connect to systems. Systems connect to applications, experiments, failures, repairs, and evidence. The goal is to let you see not only what was built, but how the work developed and what supports each claim.",
  "The public experience is built primarily with HTML, CSS, and JavaScript so the interface stays portable and inspectable in the browser. Three.js drives the three-dimensional brain. Web Workers, AudioWorklet, WebGPU, WebAssembly paths, and browser storage are used where they help move computation onto the visitor's device instead of hiding everything behind a server.",
  "For optional local AI, Gemma 4 E2B is the current browser reasoning model through LiteRT-LM. Whisper Tiny English provides local speech recognition through Transformers.js, and Chatterbox ONNX uses the selected Voice One reference for Agent Lee's generated speech. These choices are not here because a model name is fashionable. They were chosen to test how much useful AI can run locally, remain portable, and keep the architecture visible.",
  "LeeWay Standards govern the larger idea behind all of this: models are capabilities, not authorities. Generation is not proof. Running is not the same as being healthy. Finished is not claimed until the evidence supports it. Human intent, verification, and responsibility stay above the machine.",
  "That is the movement behind LeeWay: use artificial intelligence to expand human capability without surrendering human judgment, ownership, or accountability. Build boldly, question the output, preserve the failures, verify the result, and let evidence decide what can honestly be called complete.",
  "While I speak, the Digital Brain is preparing behind this screen. If you allow microphone access, it is used for browser-local speech recognition and interruption. The camera is not requested. When this introduction ends, enter the brain, explore the work, and question the evidence."
 ];
 root.LeeWayIntroCopy=Object.freeze({
  version:"2026-09-28.1",
  title:"Welcome to the LeeWay Digital Brain",
  eyebrow:"RAPID WEB DEVELOP × LEEWAY",
  state:"PUBLIC WORKING ESTATE",
  segments:Object.freeze(segments),
  text:segments.join(" "),
  stack:Object.freeze([
   ["HTML / CSS / JavaScript","browser-native, portable public interface"],
   ["Three.js","3D Digital Brain and spatial navigation"],
   ["Web Workers + AudioWorklet","background model work and live audio capture"],
   ["WebGPU + WASM","device-side acceleration and fallback execution"],
   ["Gemma 4 E2B + LiteRT-LM","optional browser-local reasoning"],
   ["Whisper Tiny.en + Transformers.js","local speech recognition"],
   ["Chatterbox ONNX + Voice One","optional local Agent Lee speech"]
  ]),
  evidence:Object.freeze(["VERIFIED / RECEIPTED WORK","ACTIVE BUILDS","PROTOTYPES / RESEARCH / EXPERIMENTS"]),
  permission:"Microphone is optional and requested from your browser for local speech recognition and interruption. Camera access is not requested. Large AI model downloads remain optional."
 });
})(globalThis);
