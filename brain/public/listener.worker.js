// Local transcription. Microphone audio never leaves this worker/browser.
import {pipeline, env} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/+esm';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1; // GitHub Pages has no cross-origin-isolation headers.
let transcriber, loading, queue=Promise.resolve();
const load=()=>loading ||= pipeline('automatic-speech-recognition','onnx-community/whisper-tiny.en',{
  revision:'2575352d61be1bf7225cf8f8b268a4678025fc58',device:'wasm',dtype:'q8',
  progress_callback:progress=>postMessage({type:'progress',progress})
}).then(value=>(transcriber=value)).catch(error=>{loading=null;throw error});
self.onmessage=({data})=>{
  const run=async()=>{
    try{
      await load();
      if(data.type==='load'){postMessage({type:'ready',id:data.id});return;}
      if(data.type==='transcribe'){
        const result=await transcriber(new Float32Array(data.audio),{return_timestamps:false,chunk_length_s:20});
        postMessage({type:'transcript',id:data.id,text:result.text||''});
      }
    }catch(error){postMessage({type:'error',id:data.id,error:error.message||'Speech recognition failed.'});}
  };
  queue=queue.then(run,run);
};
