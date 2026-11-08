/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.TESTS
TAG: LEEWAY.RAPIDWEBDEV.ENGINEERING_JOURNEY_INTERACTION_TEST
5WH:
WHAT = Test portfolio conversation entry, microphone privacy controls, and Codex's reserved public question contract.
WHY = Preserve the one-click path without falsely certifying acoustic or Machine Consciousness execution.
WHO = LeeWay Industries / Creator-authorized RapidWebDev contributors.
WHERE = brain/public/engineering-journey-interaction.test.cjs in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Node VM browser-event fixture plus static contract and source assertions.
LICENSE = Existing repository terms unchanged; no new license asserted.
*/
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=path=>fs.readFileSync(__dirname+'/'+path,'utf8');
test('opening page offers distinct narrated discussion and recording-only paths',()=>{
 const page=read('../../index.html'),brain=read('public-brain.js');
 for(const id of ['introStoryTalk','introStoryBegin','introStorySkip','agentEngineeringStory','agentEvidence','agentEvidenceList']){
  assert.ok(page.includes('id="'+id+'"'),id);
 }
 assert.ok(brain.includes("window.addEventListener('leeway-start-engineering-conversation'"));
 assert.ok(brain.includes('async function startEngineeringJourney()'));
 assert.ok(brain.includes("await handleAgentCommand('tell me the story')"));
 assert.ok(brain.includes("if(document.hidden&&conversationSession.requested)endVoice()"));
 assert.ok(brain.includes('showPublicAnswerSources(narrative.sources)'));
 assert.ok(brain.includes('url.hostname!==\'github.com\''));
});
test('intro talk gesture emits exactly one conversation entry; recorded intro remains separate',()=>{
 const callbacks={};
 const emitted=[];
 const ui={};
 for(const id of ['#introStoryGlass','#introStoryScroll','#introStoryBegin','#introStoryTalk','#introStorySkip','#introStoryStatus']){
  const node={textContent:'',disabled:false,classList:{add(){}},addEventListener(name,cb){callbacks[id+':'+name]=cb;},remove(){}};
  ui[id]=node;
 }
 let paused=false;
 class FakeAudio{constructor(){this.paused=false;}pause(){paused=true;}addEventListener(){}}
 const scope={
  document:{querySelector:id=>ui[id],body:{classList:{remove(){}}}},
  Audio:FakeAudio,
  CustomEvent:class{constructor(type){this.type=type;}},
  setTimeout:()=>0,clearTimeout:()=>{},
  requestAnimationFrame:()=>{},
  dispatchEvent(event){emitted.push(event.type);}
 };
 vm.createContext(scope);
 vm.runInContext(read('intro-story.js'),scope);
 assert.equal(typeof callbacks['#introStoryTalk:click'],'function');
 callbacks['#introStoryTalk:click']();
 assert.equal(paused,true);
 assert.deepEqual(emitted,['leeway-story-intro-complete','leeway-start-engineering-conversation']);
 assert.equal(ui['#introStoryGlass'].classList.add instanceof Function,true);
});
test('reserved consciousness integration is unbound and rejects incorrect public authority/LLM profile',()=>{
 const contract=JSON.parse(read('../contracts/public-portfolio-question.v1.json'));
 const brain=read('public-brain.js');
 assert.equal(contract.implementationState,'CONTRACT_ONLY_UNBOUND');
 assert.equal(contract.serviceOwner,'4citeB4U/Leeway-Runtime-Fabric');
 assert.equal(contract.cognitiveProviderOwner,'4citeB4U/Machine-Consciousness');
 assert.equal(contract.response.policy,'READ_ONLY_PORTFOLIO');
 assert.equal(contract.response.llm.used,false);
 assert.ok(brain.includes("typeof fabric?.publicQuestion==='function'"));
 assert.ok(brain.includes("output?.llm?.used!==false"));
 assert.ok(brain.includes("output?.policy!=='READ_ONLY_PORTFOLIO'"));
 assert.ok(brain.includes('optionalModelOptIn&&fabric?.state'));
 assert.ok(brain.includes('optionalModelOptIn&&browserGemma?.state'));
 assert.doesNotMatch(JSON.stringify(contract),/\/respond\"\s*:\s*\"https?:\/\//);
});
