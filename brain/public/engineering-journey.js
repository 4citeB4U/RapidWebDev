/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.PUBLIC_BRAIN
TAG: LEEWAY.RAPIDWEBDEV.ENGINEERING_JOURNEY_V1
5WH:
WHAT = Source-linked, bounded engineering storytelling responses for the existing Agent Lee interface.
WHY = Explain the purpose, iteration, design method, and evidence behind LeeWay without fabricating a cognitive execution claim.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/engineering-journey.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Match explicit visitor questions to published first-party engineering chapters and return their provenance; no network, LLM, host commands, or private information.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
(function(root){
  'use strict';
  const storyUrl='https://github.com/4citeB4U/RapidWebDev/blob/main/leeway-story.html';
  const standardsUrl='https://github.com/4citeB4U/LeeWay-Standards/blob/main/Docs/governance/LEEWAY-CANONICAL-ENGINEERING-LAWS.md';
  const engineeringUrl='https://github.com/4citeB4U/LeeWay-Engineering/blob/main/README.md';
  const engineeringLoop='https://github.com/4citeB4U/LeeWay-Engineering/blob/main/docs/diagrams/01-engineering-loop.mmd';
  const formulaUrl='https://github.com/4citeB4U/Leeway-formula-live';
  const consciousnessUrl='https://github.com/4citeB4U/Machine-Consciousness/blob/main/README.md';
  const skillsUrl='https://github.com/4citeB4U/LeeWay-Agent-Skills/blob/main/AGENTS.md';
  const voiceUrl='https://github.com/4citeB4U/LeeWay-Voice-Fabric/blob/main/README.md';
  const bridgeUrl='https://github.com/4citeB4U/LEEWAY-DEVICE-BRIDGE/blob/main/README.md';
  const chapters=Object.freeze([
    {
      id:'purpose',title:'The idea before the machine',
      text:"Before LeeWay had a Runtime, a Formula, or a Digital Brain, there was a question: what if an idea could become a working system another person could use? The Creator wanted more than separate demonstrations. Each design needed purpose. Each part had to support the next. That is why this portfolio is not just a collection of finished-looking screens. It follows the journey from imagination, through mathematics and engineering, toward something that can actually be tested.",
      sources:[storyUrl]
    },
    {
      id:'iteration',title:'Building, rebuilding, redesigning',
      text:"The work did not arrive fully formed. There was building and rebuilding, design and redesign. A good idea met a real constraint, and the design changed. Then another test revealed something more. That rhythm was not wasted motion; it was how the engineering method became clearer. Keep what holds. Measure what does not. Repair the smallest broken boundary and try again. Not perfection proclaimed from a podium—progress that can stand up to inspection.",
      sources:[storyUrl,engineeringUrl,standardsUrl]
    },
    {
      id:'engineering',title:'The method behind the work',
      text:"LeeWay Engineering turned that habit into a repeatable discipline. Investigate, diagnose, plan, implement, test and validate. Repair what failed, retest it, verify the result and preserve evidence. Then checkpoint the proven work and continue. The method asks every contributor to identify the original mission, protect prior accomplishments, preserve source and demonstrate the outcome—not just claim it. The Creator's design prowess is visible in the connection between those decisions: the architecture was developed so every iteration teaches the next one.",
      sources:[engineeringUrl,engineeringLoop,standardsUrl]
    },
    {
      id:'formula',title:'Putting mathematics under the decisions',
      text:"As LeeWay's parts grew, the question changed from what can we build to how do we decide correctly? The Formula expresses governance, routing, evidence, recovery and resource budgets as mathematical control problems. That matters because a powerful capability still needs a rule for when it may act, a path to the right provider, and proof afterward. The public story can explain those specifications, but showing an equation on this page does not mean its evaluator actually ran.",
      sources:[storyUrl,formulaUrl,standardsUrl]
    },
    {
      id:'consciousness',title:'A governed machine consciousness',
      text:"Machine Consciousness brought the different strands toward a common purpose: identity, state, governed decisions, capability routing and continuity. Agent Lee is the public identity and conversational interface, not a replacement for the consciousness engine. Local source and acceptance records demonstrate some bounded deterministic, non-LLM actions. That is an engineering milestone, not a claim of unrestricted conversation or human awareness. The next step is proving the whole route—not imagining the missing evidence.",
      sources:[consciousnessUrl,standardsUrl]
    },
    {
      id:'voice',title:'A voice for the journey',
      text:"An engineering journey is meant to be heard as well as seen. LeeWay Voice Fabric separates what Agent Lee says from how he speaks. The selected speaker is governed by the published Voice Fabric profile; the Voice One clone is a separate optional package, never a silent substitute. And a real conversation has room for interruption: stop the sound, listen to the new question, but do not erase unrelated work. A working website control is only one step. The real voice is proven when the microphone, the answer and the sound all work together on a physical device.",
      sources:[voiceUrl,consciousnessUrl]
    },
    {
      id:'devices',title:'From the screen to the real device',
      text:"Device Bridge answers another question: how can a digital system operate where the real work happens? A PC, phone or browser offers capabilities, but no single machine or drive should become LeeWay's identity. The Bridge provides governed access to authorized device functions. A discovered tool is not a completed action. Permission, execution, observation and receipts must remain distinct. This is why the same architecture must be able to move beyond the first workstation.",
      sources:[bridgeUrl,standardsUrl]
    },
    {
      id:'identity',title:'Why Agent Lee was created',
      text:"Why Agent Lee? As LeeWay grew from one application into many connected capabilities, its Creator needed continuity—one governed identity that could guide a person through the work instead of making every screen feel like a different assistant. Agent Lee became the recognizable voice and interface to that system. But identity is not execution authority. Standards govern the rules. Formula frames mathematical decisions. Runtime Fabric carries work forward. Machine Consciousness is the cognitive runtime, and Device Bridge connects authorized devices. Agent Lee's job is to tell the story, answer within supported knowledge, and make it clear what has actually been proven. He is the guide through the journey, not a substitute for the entire machine.",
      sources:[consciousnessUrl,skillsUrl,standardsUrl]
    },
    {
      id:'next',title:'An unfinished road worth building',
      text:"Now look back at the road. Imagination became architecture. Repeated redesign became an engineering method. Mathematics became part of the decision boundary; skills and runtime became a way to act; evidence became the way to distinguish a proven result from an attractive promise. There is more work ahead—more devices, more reliable voice, stronger qualification and new capabilities. LeeWay's story is not that every challenge has been solved. It is that each lesson should leave the system better prepared for the next one.",
      sources:[storyUrl,engineeringUrl,consciousnessUrl]
    }
  ]);
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  let active=-1;
  function select(question){
    const q=normalize(question);
    if(!q||q.length>600)return null;
    if(/^(next|next chapter|continue|continue the story|keep going|what happened next|go on|tell me more)$/.test(q))return (active+1)%chapters.length;
    if(/^(previous chapter|last chapter|go back a chapter)$/.test(q))return active<1?0:active-1;
    if(/\b(voice fabric|voice one|voice identity|why.*voice)\b/.test(q))return 5;
    if(/\b(device bridge|hardware|phone|other devices)\b/.test(q))return 6;
    if(/\b(machine consciousness|consciousness|not an llm|without an llm)\b/.test(q))return 4;
    if(/\b(formula|mathematics|mathematical|equation)\b/.test(q))return 3;
    if(/\b(engineering|methodology|engineering loop|design process|design prowess)\b/.test(q))return 2;
    if(/\b(redesign(?:ing|ed|s)?|rebuild(?:ing|s)?|iteration|iterative|trial and error|improv(?:e|ed|ing|ement))\b/.test(q))return 1;
    if(/\b(why agent lee|why.*create.*agent lee|why.*build.*agent lee|who is agent lee|why does agent lee exist|purpose of agent lee)\b/.test(q))return 7;
    if(/\b(what comes next|future of leeway|the future|what is next)\b/.test(q))return 8;
    if(/\b(why leeway|why did.*(build|create)|why was.*(built|created)|tell.*story|the journey|how.*(start|begin)|what inspired|what led to leeway|purpose of leeway)\b/.test(q))return 0;
    return null;
  }
  function answer(question){
    const index=select(question);if(index===null)return null;active=index;
    const chapter=chapters[index];
    return {intent:'portfolio.engineering.story',chapter:chapter.id,title:chapter.title,text:chapter.text,
      sources:chapter.sources.slice(),llm:{used:false,endpoint:null},
      formulaExecution:'NOT_EXECUTED',providerExecution:'NOT_EXECUTED',
      evidenceClass:'CURATED_PUBLIC_SOURCE_NARRATION',remainingChapters:chapters.length-index-1};
  }
  root.LeeWayEngineeringJourney=Object.freeze({answer,chapters:chapters.map(({id,title,sources})=>({id,title,sources:[...sources]})),reset(){active=-1;}});
})(globalThis);
