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
  const voiceUrl='https://github.com/4citeB4U/LeeWay-Voice-Fabric/blob/main/README.md';
  const bridgeUrl='https://github.com/4citeB4U/LEEWAY-DEVICE-BRIDGE/blob/main/README.md';
  const chapters=Object.freeze([
    {
      id:'purpose',title:'The idea before the machine',
      text:"Every system begins as a question somebody refuses to let go. LeeWay started with that creative pressure: what if imagination could become something measurable, something another person could actually use? The Creator did not want a gallery of disconnected experiments. The purpose was to move an idea through mathematics, architecture, testing and repair until a real capability could stand on its own. This is an engineering journey, not a claim that every part has already reached production.",
      sources:[storyUrl]
    },
    {
      id:'iteration',title:'Building, rebuilding, redesigning',
      text:"The path was not a straight line. The Creator describes building, rebuilding, designing and redesigning—each revision asking what worked, what failed and what the next version should preserve. That repeated work shaped the LeeWay design method. A successful component should be reused. A failed boundary should be diagnosed, repaired and tested again, rather than hidden behind a new name. The aim is disciplined improvement, not a claim of perfection.",
      sources:[storyUrl,engineeringUrl,standardsUrl]
    },
    {
      id:'engineering',title:'The method behind the work',
      text:"Here is where those repeated designs became a method. LeeWay Engineering teaches the loop: investigate, diagnose, plan, implement, test, validate, repair, retest, verify and preserve evidence. It starts with what already exists, respects the last proven checkpoint and requires a real test before a victory is declared. Each result leaves a trail another contributor can inspect. That is how engineering knowledge can improve from one project to the next without forgetting why a decision was made.",
      sources:[engineeringUrl,engineeringLoop,standardsUrl]
    },
    {
      id:'formula',title:'Putting mathematics under the decisions',
      text:"As projects grew, another question appeared: how does a system decide which capability to use, which action is permitted and whether a result is proven? The LeeWay Formula project expresses governance, routing, evidence, recovery and resource limits as mathematical control problems. Formula authority is separate from this public website. Showing an equation is not executing the evaluator, and I will not pretend otherwise.",
      sources:[storyUrl,formulaUrl,standardsUrl]
    },
    {
      id:'consciousness',title:'A governed machine consciousness',
      text:"The next ambition was more than a chatbot. LeeWay Machine Consciousness is designed as a deterministic cognitive and orchestration runtime, while Agent Lee supplies its public identity and interaction. Existing local evidence records bounded actions without an LLM, including verified read-only operations. That is meaningful progress, but it does not prove unrestricted conversation, human consciousness or production readiness on every device. The story continues at the boundary between intention, real action and evidence.",
      sources:[consciousnessUrl,standardsUrl]
    },
    {
      id:'voice',title:'A voice for the journey',
      text:"A system that can reason and act still needs a way to meet people where they are. LeeWay Voice Fabric separates the words Agent Lee produces from how he speaks them. Voice One is the selected identity, and interruption should stop speech without automatically erasing the work behind it. On this portfolio we want a real conversation: a question heard with permission, an answer supported by LeeWay sources, and a voice that can finish the thought. Full acoustic acceptance is still something to prove.",
      sources:[voiceUrl,consciousnessUrl]
    },
    {
      id:'devices',title:'From the screen to the real device',
      text:"The Device Bridge grew from the same idea of independence. A browser, workstation or phone is a body that offers capabilities; none should become LeeWay's permanent identity. The Bridge defines how authorized capabilities are discovered and operated on the actual hardware. A registered capability is not the same as a qualified physical action, so LeeWay tracks discovery, permission, execution and receipt separately.",
      sources:[bridgeUrl,standardsUrl]
    },
    {
      id:'next',title:'An unfinished road worth building',
      text:"Look across the projects and you can see the pattern: imagination becomes a design; design becomes software; software faces the test; failures become the next engineering lesson. LeeWay aims to make those lessons portable—across people, devices and businesses—without surrendering the Creator's authority or the evidence. There is still work to qualify, and that matters. The point of the journey is not to call the machine perfect. It is to make every proven step count.",
      sources:[storyUrl,engineeringUrl,consciousnessUrl]
    }
  ]);
  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  let active=-1;
  function select(question){
    const q=normalize(question);
    if(!q||q.length>600)return null;
    if(/^(next chapter|continue the story|keep going|what happened next|go on)$/.test(q))return (active+1)%chapters.length;
    if(/^(previous chapter|last chapter|go back a chapter)$/.test(q))return active<1?0:active-1;
    if(/\b(voice fabric|voice one|voice identity|why.*voice)\b/.test(q))return 5;
    if(/\b(device bridge|hardware|phone|other devices)\b/.test(q))return 6;
    if(/\b(machine consciousness|consciousness|not an llm|without an llm)\b/.test(q))return 4;
    if(/\b(formula|mathematics|mathematical|equation)\b/.test(q))return 3;
    if(/\b(engineering|methodology|engineering loop|design process|design prowess)\b/.test(q))return 2;
    if(/\b(redesign|rebuild|iteration|iterative|trial and error|improve)\b/.test(q))return 1;
    if(/\b(what comes next|future of leeway|the future|what is next)\b/.test(q))return 7;
    if(/\b(why leeway|why did.*(build|create)|why was.*(built|created)|tell.*story|the journey|how.*(start|begin)|what inspired)\b/.test(q))return 0;
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
