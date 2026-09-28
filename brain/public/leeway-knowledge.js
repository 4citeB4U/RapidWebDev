/* Public, pinned source knowledge. This is not a host-tool or Formula runtime. */
(function(root){
 let bundle=null,pending=null;
 const api={
  async load(){
   if(bundle)return bundle;if(pending)return pending;
   pending=(async()=>{
    const response=await fetch('/brain/public/leeway-knowledge.json?v=20260928-1');if(!response.ok)throw new Error('LeeWay source bundle could not load.');
    const value=await response.json();
    if(value.schemaVersion!==1||!Array.isArray(value.documents))throw new Error('Invalid LeeWay source bundle.');
    for(const d of value.documents){const bytes=new TextEncoder().encode(d.text);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==d.sha256)throw new Error('LeeWay source integrity check failed.');}
    bundle=value;return bundle;
   })();try{return await pending;}finally{pending=null;}
  },
  context(question){
   if(!bundle)return {sourceState:'UNAVAILABLE',formulaExecution:'NOT_EXECUTED'};
   const topic=/voice|speech|microphone|audio/i.test(question)?'voice':'design';
   return {sourceState:'PINNED_SOURCES_VERIFIED',formulaExecution:'NOT_EXECUTED',capabilities:['Navigate this website','Draft design plans or code as text','Download the displayed answer'],unavailable:['Execute generated code','Deploy or modify GitHub repositories','Run the canonical Formula evaluator','Use host tools'],sources:bundle.documents.filter(d=>d.topic===topic||d.topic==='formula').map(d=>({url:d.url,revision:d.revision,excerpt:d.text.slice(0,d.topic==='formula'?1800:2800)}))};
  }
 };
 root.LeeWayKnowledge=api;
})(globalThis);
