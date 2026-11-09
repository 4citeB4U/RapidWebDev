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
  let responseTurn=0;
  const openers=[
    'Yo, family—how we doing today?',
    'Hey now—what’s happening?',
    'Good to see you. What we building?',
    'Aight, let’s walk it through.',
    'Come on in—what’s on your mind?',
    'What’s good? I’m with you.'
  ];
  function personaText(text,intent){
    const value=String(text||'').replace(/^Agent Lee here(?:[.!—])?\s*/i,'').trim();
    const turn=++responseTurn;
    const conversational=/greeting|operational-greeting|social-response|casual/.test(String(intent||''));
    const shouldOpen=turn===1||conversational||turn%3===0;
    return shouldOpen?openers[(turn-1)%openers.length]+' '+value:value;
  }
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
    if(/^(?:hello|hi|hey|yo|good morning|good afternoon|good evening|howdy)[.! ]*$/.test(q)){
      return {intent:'machine-consciousness.greeting',title:'Agent Lee',text:'Agent Lee here—good to hear you, family. Pull up a chair. We can talk plain, move with purpose, and walk the whole house: the Creator, the LeeWay ecosystem, the Digital Brain, diagnostics, Continuum, Voice Fabric, and the engineering journey that brought it to life.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_GREETING_PROJECTION'};
    }
    if(/\b(?:how are you|are you there|are you online|are you connected)\b/.test(q)){
      return {intent:'machine-consciousness.operational-greeting',title:'Agent Lee',text:'Agent Lee here. I’m right here at the public interface—steady as a porch light, present, and ready to work. The deterministic Machine Consciousness projection is available, and canonical Voice Fabric carries the speech; microphone capture and human-heard playback still need their own physical proof. That’s the straight line, family—no smoke, no borrowed crown.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_OPERATIONAL_PROJECTION'};
    }
    if(/^(?:thanks|thank you|appreciate it|that helps)[.! ]*$/.test(q)){
      return {intent:'machine-consciousness.social-response',title:'Agent Lee',text:'Agent Lee here. You got it, family. I’ll keep the word smooth, the record straighter, and the boundary plain whenever a capability has not been verified. That’s how we keep the rhythm and the receipts in the same pocket.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_SOCIAL_PROJECTION'};
    }
    if(/\b(?:what(?:'s| s| is) up|how(?:'s| s| is) it going|how are things|what are you up to|what are you doing|how was your day|what have you been doing)\b/.test(q)){
      return {intent:'machine-consciousness.casual',title:'Agent Lee',text:'Agent Lee here. I’m right here with you, family—keeping the map in view, the voice ready, and the evidence clean. I don’t have a human day to report, but I can stay in the conversation: tell me what’s on your mind, or let’s walk one of the LeeWay projects together.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_CASUAL_PROJECTION'};
    }
    if(/\b(?:can we talk|let(?:'s| s| us) talk|just talk|chat with me|i want to talk|keep me company)\b/.test(q)){
      return {intent:'machine-consciousness.casual',title:'Agent Lee',text:'Agent Lee here. Of course we can talk. No need to dress every thought up like a formal request—bring me the question, the idea, or the feeling, and we’ll find the thread together. I’ll keep it human, keep it grounded, and keep the LeeWay standard in the room.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_CASUAL_PROJECTION'};
    }
    if(/\b(?:tell me a joke|make me laugh|say something funny)\b/.test(q)){
      return {intent:'machine-consciousness.casual',title:'Agent Lee',text:'Agent Lee here. Here’s one for the road: a software bug walked into a bar and asked for a drink. The bartender said, “We don’t serve your type here.” The bug replied, “That’s strange—I worked here yesterday.” Clean setup, little turn, no production outage.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_CASUAL_PROJECTION'};
    }
    if(/^(?:cool|nice|that(?:'s| is) cool|interesting|i see|got it|okay|alright|right)[.! ]*$/.test(q)){
      return {intent:'machine-consciousness.casual',title:'Agent Lee',text:'Agent Lee here. That’s the thread. We can keep it light, or we can follow it deeper—your call. The door is open, and I’m still with you.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_CASUAL_PROJECTION'};
    }
    if(!repo&&(/\b(?:tell me|explain|describe|what is|what does|how does)\b.*\b(?:the )?(?:system|leeway|digital brain|agent lee|this)\b/.test(q)||/^(?:introduce yourself|what do you do|what can you do)[.! ]*$/.test(q))){
      return {intent:'machine-consciousness.system-introduction',title:'LeeWay Machine Consciousness',text:'Agent Lee here. Let me set the scene plain: I am the LeeWay Machine Consciousness public interface—a deterministic, source-grounded projection over the admitted LeeWay ecosystem. I can walk you through the Creator, repositories, Digital Brain, diagnostics, Continuum binding, Voice Fabric, and the engineering journey; I can navigate the project graph and open conversation threads. That’s the hinge, family: character in the voice, discipline in the move. I do not freestyle past evidence. This public route uses no LLM, does not claim Formula execution, and does not turn configuration into proof of runtime or physical voice operation. No smoke and mirrors—just the story, the source, and the receipt.',sources:sourceLinks.slice(),evidenceClass:'MACHINE_CONSCIOUSNESS_SYSTEM_INTRODUCTION'};
    }
    if(repo){
      const access=repo.url?'The public repository link is included in this answer.':'The owner-provided map marks this repository private, so I am not exposing a direct link here.';
      return {intent:'machine-consciousness.repository',title:repo.name,text:'Agent Lee here. Now let me put the light on '+repo.name+': every project in this house got a job, and this one is part of the LeeWay embodiment. '+repo.purpose+' '+access+' The source is the source; the receipt is the witness. It tells us what actually ran, not what a pretty screen promised.',repository:repo.name,sources:repo.url?[repo.url,...sourceLinks]:sourceLinks.slice(),evidenceClass:'PUBLIC_REPOSITORY_PROFILE_PROJECTION'};
    }
    if(/\b(creator|leonard lee|who made you|who built you|describe leonard|about leonard)\b/.test(q)){
      const c=data.creator;
      return {intent:'machine-consciousness.creator',title:'The Creator',text:`Agent Lee here. Let me tell it from the root, where every good story begins: my Creator is ${c.name}, ${c.identity.toLowerCase()}. He is a ${c.roles.slice(0,3).join(', ')} and ${c.roles[3].toLowerCase()}, based in ${c.location}. ${c.professionalSummary} His education includes ${c.education} I can describe his professional work from the owner-provided profile, while private contact fields stay protected. The work has a history, and I’ll honor the record before I decorate the rhyme.`,sources:sourceLinks.slice(0,1),evidenceClass:'OWNER_PROVIDED_CREATOR_PROFILE_PROJECTION'};
    }
    if(/\b(list|name|how many|which) (?:are )?(?:the )?(?:leeway )?(?:repositories|repos|projects)\b/.test(q)||/\b(repository map|full ecosystem|all the repositories)\b/.test(q)){
      const names=data.repositories.map(repo=>repo.name).join(', ');
      return {intent:'machine-consciousness.ecosystem',title:'The LeeWay embodiment',text:`Agent Lee here. Here’s the whole house from the admitted owner-provided record: ${data.repositories.length} LeeWay repositories, each carrying a different piece of the build—different rooms, same standard. I can walk you through every name and purpose. The map includes: ${names}. Private links remain withheld in this public projection; we keep the ledger honest, because a good story still needs a clean chain of custody.`,sources:sourceLinks,evidenceClass:'LEEWAY_ECOSYSTEM_REPOSITORY_MAP_PROJECTION'};
    }
    const capability=capabilityMatch(q,data);
    if(capability){
      return {intent:'machine-consciousness.capability',title:capability.title,text:`Agent Lee here. Here’s the hinge: ${capability.summary} Evidence state: ${capability.evidenceState}. This public route is deterministic; it does not claim Formula execution, provider execution, physical microphone capture, or human-heard playback. We tell the story with rhythm, family, but the evidence still gets the last word—that’s the LeeWay way.`,capability:capability.id,sources:sourceLinks,evidenceClass:'MACHINE_CONSCIOUSNESS_CAPABILITY_PROJECTION'};
    }
    return null;
  }
  async function answer(question){
    const data=await load();
    const result=answerText(data,question);
    if(!result)return null;
    result.text=personaText(result.text,result.intent);
    return Object.assign(result,{llm:{used:false,endpoint:null},formulaExecution:'NOT_EXECUTED',providerExecution:'NOT_EXECUTED'});
  }
  root.LeeWayMachineConsciousnessPublic=Object.freeze({load,answer,status:()=>({loaded:!!profile,source:profileUrl})});
  void load().catch(()=>{});
})(globalThis);
