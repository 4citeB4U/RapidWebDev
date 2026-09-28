// Explicit opt-in browser inference. No prompts leave this browser.
const MODEL=Object.freeze({name:'Gemma 4 E2B',bytes:2008432640,revision:'b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1',runtime:'0.17.1'});
let worker=null,sequence=0,state='idle',active=null;
const pending=new Map();
function abortError(){return new DOMException('Canceled','AbortError')}
function ensureWorker(){
  if(worker)return;
  // LiteRT's WASM loader uses importScripts, which requires a classic worker.
  worker=new Worker(new URL('./gemma-browser-worker.js?v=20260928-retry1',import.meta.url));
  worker.onmessage=({data:m})=>{
    const p=pending.get(m.id);if(!p)return;
    if(m.type==='progress'){p.onProgress?.(m.value);return}
    if(m.type==='state'){state=m.value;p.onState?.(m.value);return}
    if(m.type==='token'){if(!p.canceled)p.onToken?.(m.value);return}
    pending.delete(m.id);active=null;
    if(p.canceled){state=m.ready===false?'idle':'ready';p.reject(abortError())}
    else if(m.type==='error'){state=m.ready?'ready':'idle';const e=new Error(m.message);e.name=m.name||'Error';p.reject(e)}
    else{state='ready';p.resolve(m.value)}
  };
  worker.onerror=event=>{const error=new Error(event.message||'Browser model worker failed');unload(error)};
}
function request(type,options={}){
  if(active)return Promise.reject(new Error('A browser model operation is already running.'));
  if(options.signal?.aborted)return Promise.reject(abortError());
  ensureWorker();const id=++sequence;active={id,type};
  if(type==='load')state='loading';
  return new Promise((resolve,reject)=>{
    const stop=()=>cancel();
    const finish=fn=>value=>{options.signal?.removeEventListener('abort',stop);fn(value)};
    pending.set(id,{...options,resolve:finish(resolve),reject:finish(reject)});
    options.signal?.addEventListener('abort',stop,{once:true});
    const {signal,onToken,onProgress,onState,...payload}=options;
    worker.postMessage({id,type,...payload});
  });
}
async function supported(){
  if(!globalThis.isSecureContext||!navigator.gpu)return false;
  return Boolean(await navigator.gpu.requestAdapter().catch(()=>null));
}
async function load(options={}){
  if(state==='ready'){options.onState?.('ready');return MODEL}
  if(!await supported())throw new Error('This browser needs WebGPU and a supported GPU. Try an updated Chrome or Edge browser.');
  try{return await request('load',options);}catch(error){unload(error);throw error;}
}
async function generate(prompt,options={}){
  if(state!=='ready')throw new Error('Load the browser model first.');
  return request('generate',{...options,prompt:String(prompt)});
}
function cancel(){
  if(!active)return;
  if(active.type==='load'){unload(abortError());return}
  const request=pending.get(active.id);if(request)request.canceled=true;
  worker?.postMessage({type:'cancel',id:active.id});
}
function unload(reason=abortError()){
  worker?.terminate();worker=null;active=null;state='idle';
  for(const p of pending.values())p.reject(reason);
  pending.clear();
}
export const LeeWayBrowserGemma={MODEL,supported,load,generate,cancel,unload,get state(){return state}};
globalThis.LeeWayBrowserGemma=LeeWayBrowserGemma;
