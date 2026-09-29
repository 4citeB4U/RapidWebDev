/* LeeWay Digital Brain — canonical GitHub fabric projection.
   GitHub contracts are authority/configuration inputs; runtime health is verified separately. */
(function(root){
  'use strict';
  const SOURCES=Object.freeze({
    voice:{
      repo:'4citeB4U/LeeWay-Voice-Fabric',
      contract:'https://raw.githubusercontent.com/4citeB4U/LeeWay-Voice-Fabric/main/contracts/voice-fabric.v1.json',
      binding:'https://raw.githubusercontent.com/4citeB4U/LeeWay-Voice-Fabric/main/contracts/agent-voice-binding.v1.json',
      pages:'https://4citeb4u.github.io/LeeWay-Voice-Fabric/'
    },
    runtime:{
      repo:'4citeB4U/Leeway-Runtime-Fabric',
      registry:'https://raw.githubusercontent.com/4citeB4U/Leeway-Runtime-Fabric/main/adapter.registry.json',
      health:'https://leeway-runtime-fabric.fly.dev/runtime/health',
      agentHealth:'https://leeway-runtime-fabric.fly.dev/agent-lee/health',
      chat:'https://leeway-runtime-fabric.fly.dev/v1/chat/completions'
    },
    skills:{
      repo:'4citeB4U/LeeWay-Agent-Skills',
      manifest:'https://raw.githubusercontent.com/4citeB4U/LeeWay-Agent-Skills/main/docs/formula-fabric-manifest.json',
      registry:'https://raw.githubusercontent.com/4citeB4U/LeeWay-Agent-Skills/main/scripts/skills-registry.json'
    },
    formula:{
      repo:'4citeB4U/Leeway-formula-live',
      bindings:'https://raw.githubusercontent.com/4citeB4U/Leeway-formula-live/main/contracts/ecosystem-bindings.json',
      consumer:'https://raw.githubusercontent.com/4citeB4U/Leeway-formula-live/main/contracts/consumer-contract.json'
    }
  });
  const state={status:'LOADING',loadedAt:null,sources:{},runtime:null,agent:null,error:null};
  const get=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url+' HTTP '+r.status);return r.json();};
  async function load(){
    state.status='LOADING';state.error=null;
    const jobs=[
      ['voiceContract',SOURCES.voice.contract],
      ['voiceBinding',SOURCES.voice.binding],
      ['skillsManifest',SOURCES.skills.manifest],
      ['skillsRegistry',SOURCES.skills.registry],
      ['formulaBindings',SOURCES.formula.bindings],
      ['formulaConsumer',SOURCES.formula.consumer]
    ];
    const settled=await Promise.all(jobs.map(async([key,url])=>{
      try{return [key,{ok:true,url,data:await get(url)}]}
      catch(error){return [key,{ok:false,url,error:error.message}]}
    }));
    state.sources=Object.fromEntries(settled);
    const authorityPass=settled.every(([,v])=>v.ok);
    try{state.runtime=await get(SOURCES.runtime.health)}catch(error){state.runtime={status:'UNAVAILABLE',error:error.message}}
    try{state.agent=await get(SOURCES.runtime.agentHealth)}catch(error){state.agent={status:'UNAVAILABLE',error:error.message}}
    state.loadedAt=new Date().toISOString();
    state.status=authorityPass?'AUTHORITY_CONNECTED':'AUTHORITY_DEGRADED';
    render();
    root.dispatchEvent(new CustomEvent('leeway-fabric-ready',{detail:snapshot()}));
    return snapshot();
  }
  function snapshot(){return JSON.parse(JSON.stringify({status:state.status,loadedAt:state.loadedAt,sources:state.sources,runtime:state.runtime,agent:state.agent,repos:Object.fromEntries(Object.entries(SOURCES).map(([k,v])=>[k,v.repo]))}));}
  function render(){
    const summary=document.querySelector('#fabricStatusSummary'),grid=document.querySelector('#fabricStatusGrid'),startup=document.querySelector('#agentStartupStatus');
    if(!summary&&!grid&&!startup)return;
    const cards=[
      ['Voice Fabric',state.sources.voiceContract?.ok?'PASS':'DEGRADED','Voice identity + speech contract'],
      ['Runtime Fabric',state.runtime?.status==='ok'?'PASS':'DEGRADED',state.runtime?.status||'runtime unavailable'],
      ['Agent Skills',state.sources.skillsRegistry?.ok?'PASS':'DEGRADED','Capability registry'],
      ['Formula Live',state.sources.formulaConsumer?.ok?'PASS':'DEGRADED','Mathematical authority']
    ];
    if(grid)grid.innerHTML=cards.map(([name,st,note])=>'<div class="fabric-status-card" data-state="'+st+'"><b>'+name+'</b><span>'+st+' · '+note+'</span></div>').join('');
    const all=cards.every(c=>c[1]==='PASS');
    if(summary)summary.textContent=all?'LeeWay fabrics connected. Runtime execution and source authority are reported separately.':'LeeWay fabric connection is degraded. See individual status cards.';
    if(startup)startup.textContent=all?'Agent Lee · LeeWay fabrics ready':'Agent Lee · fabric degraded';
  }
  function context(){
    const s=snapshot();
    return {
      authority:s.status,
      runtime:s.runtime?.status||'UNAVAILABLE',
      agent:s.agent?.status||'UNAVAILABLE',
      voiceAuthority:SOURCES.voice.repo,
      runtimeAuthority:SOURCES.runtime.repo,
      skillsAuthority:SOURCES.skills.repo,
      formulaAuthority:SOURCES.formula.repo,
      formulaRule:'Do not claim Formula execution unless an authorized evaluator mapping actually ran.'
    };
  }
  async function chat(messages,{model='qwen2.5-coder:14b',signal}={}){
    const r=await fetch(SOURCES.runtime.chat,{method:'POST',headers:{'Content-Type':'application/json','x-leeway-profile':'rapidweb-digital-brain'},body:JSON.stringify({model,messages}),signal});
    let body={};try{body=await r.json()}catch{}
    if(!r.ok)throw new Error(body?.error||body?.message||('Runtime Fabric chat HTTP '+r.status));
    return body;
  }
  root.LeeWayEcosystemFabric={SOURCES,state,load,snapshot,context,chat,render};
  load().catch(error=>{state.status='AUTHORITY_DEGRADED';state.error=error.message;render();root.dispatchEvent(new CustomEvent('leeway-fabric-ready',{detail:snapshot()}));});
})(globalThis);
