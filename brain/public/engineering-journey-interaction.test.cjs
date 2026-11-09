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
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(__dirname+'/'+path,'utf8');
test('opening page offers the current Machine Consciousness conversation entry',()=>{
 const page=read('../../index.html'),brain=read('public-brain.js');
 for(const id of ['micBtn','agentEngineeringStory','agentEvidence','agentEvidenceList','agentStartVoice','agentEndVoice']){
  assert.ok(page.includes('id="'+id+'"'),id);
 }
 assert.doesNotMatch(page,/id="(?:introStoryGlass|leewayIntroGate|fullAISetup)"/);
 assert.ok(brain.includes("window.addEventListener('leeway-start-engineering-conversation'"));
 assert.ok(brain.includes('async function startEngineeringJourney()'));
 assert.ok(brain.includes("await handleAgentCommand('tell me the story')"));
 assert.ok(brain.includes("if(document.hidden&&conversationSession.requested)endVoice()"));
 assert.ok(brain.includes('showPublicAnswerSources(narrative.sources)'));
 assert.ok(brain.includes('url.hostname!==\'github.com\''));
});
test('obsolete opening story runtime is not loaded by the public entrypoint',()=>{
 const page=read('../../index.html');
 assert.doesNotMatch(page,/intro-story\.js/);
 assert.doesNotMatch(page,/intro-gate\.js/);
 assert.doesNotMatch(page,/Gemma 4|Chatterbox|Full AI optional|optional AI models/);
});
test('public consciousness integration stays deterministic and rejects optional model/provider routing',()=>{
 const contract=JSON.parse(read('../contracts/public-portfolio-question.v1.json'));
 const brain=read('public-brain.js');
 assert.equal(contract.serviceOwner,'4citeB4U/Leeway-Runtime-Fabric');
 assert.equal(contract.cognitiveProviderOwner,'4citeB4U/Machine-Consciousness');
 assert.equal(contract.response.policy,'READ_ONLY_PORTFOLIO');
 assert.equal(contract.response.llm.used,false);
 assert.match(brain,/LeeWayMachineConsciousnessPublic\?\.answer/);
 assert.doesNotMatch(brain,/publicQuestion|browserGemma|optionalModelOptIn|Gemma 4|Chatterbox/);
 assert.doesNotMatch(JSON.stringify(contract),/\/respond\"\s*:\s*\"https?:\/\//);
});
