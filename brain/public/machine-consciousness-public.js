/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_BRAIN
TAG: LEEWAY.RAPIDWEBDEV.MACHINE_CONSCIOUSNESS_PUBLIC_PROJECTION_V1
5WH:
WHAT = Deterministic public question routing for the admitted Machine Consciousness capability profile.
WHY = Let Agent Lee answer Creator, ecosystem, Digital Brain, diagnostics and Voice Fabric questions without exposing the local carrier.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/machine-consciousness-public.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Load the checked-in public projection, match bounded intents, return source/evidence metadata, and fail closed for unrelated questions.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
(function(root){
  'use strict';
  const profileUrl='/brain/public/agent-lee-public-knowledge.v1.json';
  let profile=null,loading=null;
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  const sourceLinks=[
    'https://github.com/4citeB4U/Machine-Consciousness',
    'https://github.com/4citeB4U/RapidWebDev',
    'https://github.com/4citeB4U/LeeWay-Standards'
  ];
  async function load(){
    if(profile)return profile;
    if(!loading)loading=fetch(profileUrl,{cache:'no-store'}).then(response=>{
      if(!response.ok)throw new Error('Machine Consciousness public profile HTTP '+response.status);
      return response.json();
    }).then(value=>{profile=value;return value;}).catch(error=>{loading=null;throw error;});
    return loading;
  }
  function repoMatch(q,data){
    return data.repositories.find(repo=>{
      const name=normalize(repo.name);
      return name.length>3&&q.includes(name);
    });
  }
  function capabilityMatch(q,data){
    if(/\b(digital brain|public brain|project graph|evidence graph)\b/.test(q))return data.capabilities.find(c=>c.id==='DIGITAL_BRAIN_PRESENTATION_CORE');
    if(/\b(diagnostics?|hardware|pc matrix|diagnostic matrix|computer)\b/.test(q))return data.capabilities.find(c=>c.id==='PC_DIAGNOSTICS_MATRIX');
    if(/\b(continuum|storage|body binding|one consciousness)\b/.test(q))return data.capabilities.find(c=>c.id==='LEEWAY_BODY_AND_CONTINUUM_BINDING');
    if(/\b(voice fabric|voice|speech|microphone|bidirectional|interruption)\b/.test(q))return data.capabilities.find(c=>c.id==='VOICE_FABRIC_BIDIRECTIONAL_CONTRACT');
    if(/\b(machine consciousness|consciousness|native student|deterministic student)\b/.test(q))return {id:'MACHINE_CONSCIOUSNESS',title:'Machine Consciousness',summary:'The sovereign deterministic cognitive and orchestration runtime. Agent Lee is its identity and interface; the public site uses a bounded projection and does not expose the local carrier.',evidenceState:'PUBLIC_PROJECTION_ONLY'};
    if(/\b(capabilit(?:y|ies)|what can you do|what do you know|full embodiment|ecosystem)\b/.test(q))return data.capabilities.find(c=>c.id==='LEEWAY_ECOSYSTEM_REPOSITORY_MAP');
    return null;
  }
  function answerText(data,question){
    const q=normalize(question);
    if(!q||q.length>600)return null;
    const repo=repoMatch(q,data);
    if(repo){
      const access=repo.url?'The public repository link is included in this answer.':'The owner-provided map marks this repository private, so I am not exposing a direct link here.';
      return {intent:'machine-consciousness.repository',title:repo.name,text:'Agent Lee here. '+repo.name+' is part of the LeeWay embodiment. '+repo.purpose+' '+access,repository:repo.name,sources:repo.url?[repo.url,...sourceLinks]:sourceLinks.slice(),evidenceClass:'PUBLIC_REPOSITORY_PROFILE_PROJECTION'};
    }
    if(/\b(creator|leonard lee|who made you|who built you|describe leonard|about leonard)\b/.test(q)){
      const c=data.creator;
      return {intent:'machine-consciousness.creator',title:'The Creator',text:`Agent Lee here. My Creator is ${c.name}, ${c.identity.toLowerCase()}. He is a ${c.roles.slice(0,3).join(', ')} and ${c.roles[3].toLowerCase()}, based in ${c.location}. ${c.professionalSummary} His education includes ${c.education} I can describe his professional work from the owner-provided profile, but I do not disclose private contact fields by default.`,sources:sourceLinks.slice(0,1),evidenceClass:'OWNER_PROVIDED_CREATOR_PROFILE_PROJECTION'};
    }
    if(/\b(list|name|how many|which) (?:are )?(?:the )?(?:leeway )?(?:repositories|repos|projects)\b/.test(q)||/\b(repository map|full ecosystem|all the repositories)\b/.test(q)){
      const names=data.repositories.map(repo=>repo.name).join(', ');
      return {intent:'machine-consciousness.ecosystem',title:'The LeeWay embodiment',text:`Agent Lee here. The admitted owner-provided map contains ${data.repositories.length} LeeWay repositories. I can describe each one by name and purpose. The map includes: ${names}. Private links remain withheld in this public projection.`,sources:sourceLinks,evidenceClass:'LEEWAY_ECOSYSTEM_REPOSITORY_MAP_PROJECTION'};
    }
    const capability=capabilityMatch(q,data);
    if(capability){
      return {intent:'machine-consciousness.capability',title:capability.title,text:`Agent Lee here. ${capability.summary} Evidence state: ${capability.evidenceState}. This public route is deterministic and does not claim Formula execution, provider execution, physical microphone capture, or human-heard playback.`,capability:capability.id,sources:sourceLinks,evidenceClass:'MACHINE_CONSCIOUSNESS_CAPABILITY_PROJECTION'};
    }
    return null;
  }
  async function answer(question){
    const data=await load();
    const result=answerText(data,question);
    if(!result)return null;
    return Object.assign(result,{llm:{used:false,endpoint:null},formulaExecution:'NOT_EXECUTED',providerExecution:'NOT_EXECUTED'});
  }
  root.LeeWayMachineConsciousnessPublic=Object.freeze({load,answer,status:()=>({loaded:!!profile,source:profileUrl})});
  void load().catch(()=>{});
})(globalThis);
