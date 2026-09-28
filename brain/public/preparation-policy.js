/* Storage preflight for optional local AI. Estimates are advisory, never RAM guarantees. */
(function(root){
 const GEMMA=2008432640,VOICE=1650000000,REV='b3ca0d2f076785a8f4b2219ddbd2bdb99954eae1';
 const gb=n=>(n/1e9).toFixed(1)+' GB';
 function assess({quota,usage,cached=0,bytes}){
  const missing=Math.max(0,bytes-cached),required=missing?Math.ceil(missing*1.15):0;
  if(!Number.isFinite(quota)||!Number.isFinite(usage))return {ok:false,message:'This browser cannot estimate available storage. The spoken guide still works. Try full AI in a browser with storage support.'};
  const available=Math.max(0,quota-usage);
  return {ok:available>=required,missing,required,available,message:available>=required?`Storage estimate: ${gb(available)} available; about ${gb(missing)} of model files still needed. Device memory must also support these models.`:`Not enough browser storage: about ${gb(required)} needed, ${gb(available)} available. Keep using the spoken guide, or free storage and retry.`};
 }
 async function check(kind='all'){
  let cachedGemma=0,cachedVoice=0;
  try{const dir=await navigator.storage.getDirectory(),h=await dir.getFileHandle(`leeway-gemma4-e2b-${REV}.litertlm`),f=await h.getFile();if(f.size===GEMMA)cachedGemma=GEMMA;}catch{}
  if(kind!=='gemma')try{
   for(const name of await caches.keys()){
    if(!name.includes('transformers'))continue;const cache=await caches.open(name);
    for(const request of await cache.keys())if(request.url.includes('/chatterbox-ONNX/resolve/3cab09af388d3f02bba43443fce88c1f4525ac43/')){
     const response=await cache.match(request);cachedVoice+=Number(response?.headers.get('content-length'))||0;
    }
   }
  }catch{}
  let estimate={};try{estimate=await navigator.storage.estimate();}catch{}
  return assess({...estimate,bytes:kind==='gemma'?GEMMA:kind==='voice'?VOICE:GEMMA+VOICE,cached:kind==='gemma'?cachedGemma:kind==='voice'?Math.min(VOICE,cachedVoice):cachedGemma+Math.min(VOICE,cachedVoice)});
 }
 root.LeeWayPreparationPolicy={check,assess};
})(globalThis);
