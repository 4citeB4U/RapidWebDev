const VERSION='0.17.1';
const REVISION='b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1';
const BYTES=2008432640;
const MODEL_URL=`https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/${REVISION}/gemma-4-E2B-it-web.litertlm`;
let engine=null,conversation=null,activeOperation=null;
const send=(id,type,value)=>postMessage({id,type,value});
async function modelSource(id){
  let handle=null,cacheRoot=null;
  const cacheName=`leeway-gemma4-e2b-${REVISION}.litertlm`;
  try{
    cacheRoot=await navigator.storage.getDirectory();
    handle=await cacheRoot.getFileHandle(cacheName,{create:true});
    const file=await handle.getFile();
    if(file.size===BYTES){send(id,'progress',{loaded:BYTES,total:BYTES,cached:true});return file}
    const space=await navigator.storage.estimate();
    if(space.quota-space.usage<BYTES*1.05)handle=null;
  }catch{handle=null}
  send(id,'state','downloading');
  const response=await fetch(MODEL_URL,{credentials:'omit'});
  if(!response.ok||!response.body)throw new Error(`Model download failed (${response.status}).`);
  let loaded=0,lastReport=0;
  const progress=new TransformStream({transform(chunk,controller){
    loaded+=chunk.byteLength;
    if(performance.now()-lastReport>200||loaded===BYTES){send(id,'progress',{loaded,total:BYTES,cached:false});lastReport=performance.now()}
    controller.enqueue(chunk);
  },flush(){if(loaded!==BYTES)throw new Error('The model download is incomplete. Please retry.')}});
  const stream=response.body.pipeThrough(progress);
  if(!handle){send(id,'progress',{loaded:0,total:BYTES,cached:false,cacheAvailable:false});return stream}
  let writable;
  try{writable=await handle.createWritable()}
  catch{send(id,'progress',{loaded:0,total:BYTES,cached:false,cacheAvailable:false});return stream}
  try{await stream.pipeTo(writable)}
  catch(error){
    // pipeTo aborts the file and cancels the download on a write failure.
    // Remove this revision's incomplete file; do not silently download 2 GB again.
    await cacheRoot.removeEntry(cacheName).catch(()=>{});
    if(error.name==='QuotaExceededError')throw new Error('Browser storage filled while caching the model. Free storage, then retry; the incomplete cache was removed.');
    throw error;
  }
  return handle.getFile();
}
onmessage=async({data:m})=>{
  if(m.type==='cancel'){
    if(activeOperation?.id===m.id){activeOperation.canceled=true;conversation?.cancel()}
    return;
  }
  const id=m.id;
  if(activeOperation){postMessage({id,type:'error',message:'A browser model operation is already running.',ready:Boolean(engine)});return}
  const operation={id,canceled:false};activeOperation=operation;
  try{
    if(m.type==='load'){
      send(id,'state','loading-runtime');
      const {Engine,loadLiteRtLm}=await import(`https://cdn.jsdelivr.net/npm/@litert-lm/core@${VERSION}/+esm`);
      // Emscripten resolves imported scripts against the classic worker URL.
      // Pin binary resolution too, so it cannot request an HTML 404 from Pages.
      self.Module={locateFile:file=>`https://cdn.jsdelivr.net/npm/@litert-lm/core@${VERSION}/wasm/${file}`};
      await loadLiteRtLm(`https://cdn.jsdelivr.net/npm/@litert-lm/core@${VERSION}/wasm/`);
      const model=await modelSource(id);
      send(id,'state','initializing');
      engine=await Engine.create({model,mainExecutorSettings:{maxNumTokens:4096}});
      send(id,'state','ready');send(id,'done',{name:'Gemma 4 E2B',bytes:BYTES,revision:REVISION,runtime:VERSION});
    }else if(m.type==='generate'){
      if(!engine)throw new Error('The browser model is not loaded.');
      const messages=[];
      if(m.system)messages.push({role:'system',content:String(m.system).slice(0,6500)});
      // Bounded recent context; each new turn gets a fresh session to prevent
      // unbounded KV-cache growth. Keep roles distinct from user text.
      for(const h of (Array.isArray(m.history)?m.history:[]).slice(-4)){
        if(['user','assistant'].includes(h.role))messages.push({role:h.role,content:String(h.content||'').slice(0,1000)});
      }
      conversation=await engine.createConversation({preface:{messages},sessionConfig:{maxOutputTokens:512}});
      let output='';
      try{
        if(operation.canceled)throw new DOMException('Canceled','AbortError');
        for await(const chunk of conversation.sendMessageStreaming(String(m.prompt||'').slice(0,2200))){
          if(operation.canceled)break;
          for(const item of chunk.content||[]){if(item.type==='text'&&item.text){output+=item.text;send(id,'token',item.text)}}
        }
        if(operation.canceled)throw new DOMException('Canceled','AbortError');
      }finally{await conversation.delete();conversation=null}
      send(id,'done',output);
    }
  }catch(error){postMessage({id,type:'error',name:operation.canceled?'AbortError':error.name,message:operation.canceled?'Canceled':error.message,ready:Boolean(engine)})}
  finally{if(activeOperation===operation)activeOperation=null}
};
